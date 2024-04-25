import * as vscode from "vscode";
import {ListModels} from "../services/listModels";
import {OLLAMA_MSG_ERROR, OLLAMA_MSG_INFO, OLLAMA_SETTING} from "../constants/ollamaConstant";
import {OllamaChat} from "../ollamaChat";

export class OllamaViewSettingsProvider implements vscode.WebviewViewProvider{
    private _view?: vscode.WebviewView;
    constructor(private context: vscode.ExtensionContext) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'send':
                        const config = vscode.workspace.getConfiguration("my-local-copilot");
                        const model = config.get("model") as string;
                        const editor = vscode.window.activeTextEditor;
                        let codeSelected = "";
                        if (editor) {
                            let document = editor.document;
                            let selection = editor.selection;
                            codeSelected = document.getText(selection);
                        }
                        const userQuestion = message.text;
                        const userRequest = {
                            question: userQuestion,
                            code: codeSelected,
                        };
                        const response = await OllamaChat(model, userRequest);
                        webviewView.webview.postMessage({ command: 'response', text: response });
                        return;
                    case 'copy':
                        vscode.window.visibleTextEditors.forEach((editor) => {
                            editor.edit((editBuilder) => {
                                editBuilder.insert(
                                    editor.selection.active,
                                    `${message.text}`
                                );
                            });
                        });
                        return;
                }
            },
            undefined,
            this.context.subscriptions
        );

        (async () => {
            webviewView.webview.html = await this._getWebviewContent(
                webviewView.webview
            );
        })();
    }

    public async _getWebviewContent(webview: vscode.Webview) {

        const stylesSettingsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "src/media", "settings.css")
        );
        console.log(stylesSettingsUri);
        const scriptTailwindJsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "src/media", "tailwindcss.3.2.4.min.js")
        );
        const stylesTailwindCssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "src/media", "tailwind.min.css")
        );

        let inputModels = "";

        try {

            const response = await ListModels();

            if (response.models.length === 0) {
                vscode.window.showInformationMessage(
                    `${OLLAMA_MSG_INFO.MODEL_FOUND} ${response.models.length}`
                );
                vscode.window.showInformationMessage(OLLAMA_MSG_INFO.MODEL_NOT_FOUND);
                return "";
            }

            const config = vscode.workspace.getConfiguration("my-local-copilot");
            const modelStored = config.get("model") as string;

            response.models.forEach((model: any) => {
                let modelName = model.model.split(":")[0];
                if(modelStored === modelName){
                    inputModels += `<label id="model-name" class="label-model-input" for=${modelName}><input type="radio" id=${modelName} name="model" checked> ${modelName}</label>`;
                }else{
                    inputModels += `<label id="model-name" class="label-model-input" for=${modelName}><input type="radio" id=${modelName} name="model"> ${modelName}</label>`;
                }
            });

        } catch (e) {
            vscode.window.showErrorMessage(OLLAMA_MSG_ERROR.OLLAMA_NOT_RUNNING);
            console.error(e);
        }

        return `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link href='${stylesSettingsUri}' rel="stylesheet">
                        <link href='${stylesTailwindCssUri}' rel="stylesheet">
                        <script src='${scriptTailwindJsUri}'></script>
                        <title>Ollama Chatbot</title>
                      </head>
                  <body>
                    <form class="form-save-model" id="settingsForm">
                      <label class="label-title-model" for="mySetting">${OLLAMA_SETTING.TITLES.MODEL_LIST}</label>
                      <label class="label-second-title" for="second-title">below is your list local models</label>
                      <section class="section-list-models">
                        ${inputModels}
                      </section>
                      
                      <input class="input-save-model" type="submit" value="Save">
                    </form>
                
                    <script>
                      const vscode = acquireVsCodeApi();
                
                      document.getElementById('settingsForm').addEventListener('submit', (event) => {
                        event.preventDefault();
                        
                        let selectedModels = '';
                        const radios = document.querySelectorAll('input[name="model"]');
                        
                        radios.forEach((radio) => {
                          if(radio.checked){
                            selectedModels = radio.parentElement.textContent.trim();   
                          }
                        });
                        
                        vscode.postMessage({
                          command: 'save',
                          value: selectedModels,
                        });
                      });
                      
                    </script>
                  </body>
                  </html>`;
    }
}