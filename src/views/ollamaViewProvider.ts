import * as vscode from "vscode";
import { OllamaChat } from "../ollamaChat";

export class OllamaViewProvider implements vscode.WebviewViewProvider {
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
          }
        },
        undefined,
        this.context.subscriptions
    );

    (async () => {
      webviewView.webview.html = await this._getHtmlForWebview(
        webviewView.webview
      );
    })();
  }

  public async _getHtmlForWebview(webview: vscode.Webview) {
    const stylesTailwindCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, "src/media", "tailwind.min.css")
    );
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "src/media", "main.css")
    );
    const scriptMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "src/media", "main.js")
    );
    const scriptTailwindJsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, "src/media", "tailwindcss.3.2.4.min.js")
    );


    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href='${stylesTailwindCssUri}' rel="stylesheet">
        <link href='${stylesMainUri}' rel="stylesheet">
        <script src='${scriptTailwindJsUri}'></script>
        <script src='${scriptMainUri}'></script>
        <title>Ollama Chatbot</title>
      </head>
      <body>
        <main>
        
          <section class="wrap-ollama-section" id="wrap-ollama-section">
          </section>
          
          <div class="wrap-ollama-input-btn- w-full flex flex-row" id="chatForm">
            <input class="req-input text-black- w-5/6" id="send-req-ollama-bot" type="text" placeholder="Type your message here">
            <button class="req-btn- w-1/6" id="send">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="darkblue" d="m12.815 12.197l-7.532 1.255a.5.5 0 0 0-.386.318L2.3 20.728c-.248.64.421 1.25 1.035.942l18-9a.75.75 0 0 0 0-1.341l-18-9c-.614-.307-1.283.303-1.035.942l2.598 6.958a.5.5 0 0 0 .386.318l7.532 1.255a.2.2 0 0 1 0 .395"/></svg>
            </button>
          </div>
          
        </main>      
      </body>
      </html>`;
  }
}
