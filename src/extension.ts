import * as vscode from "vscode";
import axios from "axios";
import { ListModels } from "./services/listModels";
import { checkOllamaRunning } from "./modules/ollamaRunning";
import {
  OLLAMA_MSG_ERROR,
  OLLAMA_SETTING,
  OLLAMA_MSG_INFO,
} from "./constants/ollamaConstant";
import { OllGenerate} from "./services/ollamaGenerate";

import { OllamaViewProvider } from "./views/ollamaViewProvider";

// part of mylocal-autocoder
let VSConfig: vscode.WorkspaceConfiguration;
let apiEndpoint: string;
let apiModel: string;
let apiMessageHeader: string;
let apiTemperature: number;
let numPredict: number;
let promptWindowSize: number;
let completionKeys: string;
let responsePreview: boolean | undefined;
let responsePreviewMaxTokens: number;
let responsePreviewDelay: number;
let continueInline: boolean | undefined;

function updateVSConfig() {
    VSConfig = vscode.workspace.getConfiguration("mylocal-autocoder");
    apiEndpoint = VSConfig.get("endpoint") || "http://localhost:11434/api/generate";
    const config = vscode.workspace.getConfiguration("my-local-copilot");
    apiModel = config.get("model") as string;
    apiMessageHeader = VSConfig.get("message header") || "";
    numPredict = VSConfig.get("max tokens predicted") || 1000;
    promptWindowSize = VSConfig.get("prompt window size") || 2000;
    completionKeys = VSConfig.get("completion keys") || " ";
    responsePreview = VSConfig.get("response preview");
    responsePreviewMaxTokens = VSConfig.get("preview max tokens") || 50;
    responsePreviewDelay = VSConfig.get("preview delay") || 0; // Must be || 0 instead of || [default] because of truthy
    continueInline = VSConfig.get("continue inline");
    apiTemperature = VSConfig.get("temperature") || 0.5;
}

updateVSConfig();

// No need for restart for any of these settings
vscode.workspace.onDidChangeConfiguration(updateVSConfig);

// Give model additional information
function messageHeaderSub(document: vscode.TextDocument) {
    return apiMessageHeader
        .replace("{LANG}", document.languageId)
        .replace("{FILE_NAME}", document.fileName)
        .replace("{PROJECT_NAME}", vscode.workspace.name || "Untitled");
}

// internal function for autocomplete, not directly exposed
async function autocompleteCommand(textEditor: vscode.TextEditor, cancellationToken?: vscode.CancellationToken) {
    const document = textEditor.document;
    const position = textEditor.selection.active;

    // Get the current prompt from editor
    let prompt = document.getText(new vscode.Range(document.lineAt(0).range.start, position));
    prompt = prompt.substring(Math.max(0, prompt.length - promptWindowSize), prompt.length);

    // Show a progress message
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Ollama Autocoder",
            cancellable: true,
        },
        async (progress, progressCancellationToken) => {
            try {
                progress.report({ message: "Starting model..." });

                let axiosCancelPost: () => void;
                const axiosCancelToken = new axios.CancelToken((c) => {
                    const cancelPost = function () {
                        c("Autocompletion request terminated by user cancel");
                    };
                    axiosCancelPost = cancelPost;
                    if (cancellationToken){
                        cancellationToken.onCancellationRequested(cancelPost);
                    }
                    progressCancellationToken.onCancellationRequested(cancelPost);
                    vscode.workspace.onDidCloseTextDocument(cancelPost);
                });

                // Make a request to the ollama.ai REST API
                const response = await axios.post(apiEndpoint, {
                        model: apiModel, // Change this to the model you want to use
                        prompt: messageHeaderSub(textEditor.document) + prompt,
                        stream: true,
                        raw: true,
                        options: {
                            num_predict: numPredict,
                            temperature: apiTemperature,
                            stop: ["```"]
                        }
                    }, {
                        cancelToken: axiosCancelToken,
                        responseType: 'stream'
                    }
                );
                // TODO: Implement prompt editor using API FUNCTION OllGenerate
                // const promptEditor = messageHeaderSub(textEditor.document) + prompt;
                // const requestPrompt = {
                //     prompt: promptEditor,
                //     inputModel: apiModel
                // };
                // const res = await OllGenerate(requestPrompt);



                //tracker
                let currentPosition = position;

                response.data.on('data', async (d: Uint8Array) => {
                    progress.report({ message: "Generating..." });

                    // Check for user input (cancel)
                    if (currentPosition.line !== textEditor.selection.end.line || currentPosition.character !== textEditor.selection.end.character) {
                        axiosCancelPost(); // cancel axios => cancel finished promise => close notification
                        return;
                    }

                    // Get a completion from the response
                    const completion: string = JSON.parse(d.toString()).response;
                    // lastToken = completion;

                    if (completion === "") {
                        return;
                    }

                    //complete edit for token
                    const edit = new vscode.WorkspaceEdit();
                    edit.insert(document.uri, currentPosition, completion);
                    await vscode.workspace.applyEdit(edit);

                    // Move the cursor to the end of the completion
                    const completionLines = completion.split("\n");
                    const newPosition = new vscode.Position(
                        currentPosition.line + completionLines.length - 1,
                        (completionLines.length > 1 ? 0 : currentPosition.character) + completionLines[completionLines.length - 1].length
                    );
                    const newSelection = new vscode.Selection(
                        position,
                        newPosition
                    );
                    currentPosition = newPosition;

                    // completion bar
                    progress.report({ message: "Generating...", increment: 1 / (numPredict / 100) });

                    // move cursor
                    textEditor.selection = newSelection;
                });

                // Keep cancel window available
                const finished = new Promise((resolve) => {
                    response.data.on('end', () => {
                        progress.report({ message: "Ollama completion finished." });
                        resolve(true);
                    });
                    axiosCancelToken.promise.finally(() => { // prevent notification from freezing on user input cancel
                        resolve(false);
                    });
                });

                await finished;

            } catch (err: any) {
                // Show an error message
                vscode.window.showErrorMessage(
                    "Ollama encountered an error: " + err.message
                );
                console.log(err);
            }
        }
    );
}
// Completion item provider callback for activate
async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, cancellationToken: vscode.CancellationToken) {

    // Create a completion item
    const item = new vscode.CompletionItem("Autocomplete with Ollama");

    // Set the insert text to a placeholder
    item.insertText = new vscode.SnippetString('${1:}');

    // Wait before initializing Ollama to reduce compute usage
    if (responsePreview) await new Promise(resolve => setTimeout(resolve, responsePreviewDelay * 1000));
    if (cancellationToken.isCancellationRequested) {
        return [ item ];
    }

    // Set the label & inset text to a shortened, non-stream response
    if (responsePreview) {
        let prompt = document.getText(new vscode.Range(document.lineAt(0).range.start, position));
        prompt = prompt.substring(Math.max(0, prompt.length - promptWindowSize), prompt.length);
        const response_preview = await axios.post(apiEndpoint, {
            model: apiModel, // Change this to the model you want to use
            prompt: messageHeaderSub(document) + prompt,
            stream: false,
            raw: true,
            options: {
                num_predict: responsePreviewMaxTokens, // reduced compute max
                temperature: apiTemperature,
                stop: ['\n', '```']
            }
        }, {
            cancelToken: new axios.CancelToken((c) => {
                const cancelPost = function () {
                    c("Autocompletion request terminated by completion cancel");
                };
                cancellationToken.onCancellationRequested(cancelPost);
            })
        });

        if (response_preview.data.response.trim() !== "") { // default if empty
            item.label = response_preview.data.response.trimStart(); // tended to add whitespace at the beginning
            item.insertText = response_preview.data.response.trimStart();
        }
    }

    // Set the documentation to a message
    item.documentation = new vscode.MarkdownString('Press `Enter` to get an autocompletion from Ollama');
    // Set the command to trigger the completion
    if (continueInline || !responsePreview){
            item.command = {
            command: 'mylocal-autocoder.autocomplete',
            title: 'Autocomplete with Ollama',
            arguments: [cancellationToken]
        };
    }
    // Return the completion item
    return [item];
}

export function activate(context: vscode.ExtensionContext) {

  const provider = new OllamaViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("ollama-chat-pilot", provider)
  );

  checkOllamaRunning();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "my-local-copilot.openSettings",
      async () => {
        const panel = vscode.window.createWebviewPanel(
          "myExtensionSettings",
          OLLAMA_SETTING.TITLES.SETTINGS,
          vscode.ViewColumn.One,
          { enableScripts: true }
        );

        panel.webview.html = await getWebviewContent(panel.webview, context);

        panel.webview.onDidReceiveMessage(
          (message) => {
            switch (message.command) {
              case "save":
                const config =
                  vscode.workspace.getConfiguration("my-local-copilot");
                config
                  .update(
                    "model",
                    message.value,
                    vscode.ConfigurationTarget.Global
                  )
                  .then(() => {
                    vscode.window.showInformationMessage(
                      `${OLLAMA_MSG_INFO.MODEL_SET_TO} ${message.value}`
                    );
                  });

                return;
            }
          },
          undefined,
          context.subscriptions
        );
      }
    )
  );
    // mylocal-autocoder
    // Register a completion provider for JavaScript files
    const completionProvider = vscode.languages.registerCompletionItemProvider("*", {
            provideCompletionItems
        },
        ...completionKeys.split("")
    );
    // Register a command for getting a completion from Ollama through command/keybind
    const externalAutocompleteCommand = vscode.commands.registerTextEditorCommand(
        "mylocal-autocoder.autocomplete",
        (textEditor, _, cancellationToken?) => {
            // no cancellation token from here, but there is one from completionProvider
            autocompleteCommand(textEditor, cancellationToken);
        }
    );
    // Add the commands & completion provider to the context
    context.subscriptions.push(completionProvider);
    context.subscriptions.push(externalAutocompleteCommand);

}

async function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext) {
    const stylesTailwindCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src/media", "tailwind.min.css")
    );
    const stylesSettingsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src/media", "settings.css")
    );
    const scriptTailwindJsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src/media", "tailwindcss.3.2.4.min.js")
    );
    const scriptSettingsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src/media", "settings.js")
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
        <link href='${stylesTailwindCssUri}' rel="stylesheet" />
        <link href='${stylesSettingsUri}' rel="stylesheet" />
       <script src="${scriptTailwindJsUri}"></script>
        <title>${OLLAMA_SETTING.TITLES.SETTINGS}</title>
    </head>
  
  <body>
    <form class="form-save-model p-3" id="settingsForm">
      <label class="label-title-model" for="mySetting">${OLLAMA_SETTING.TITLES.MODEL_LIST}</label>
      <label class="label-second-title" for="second-title">below is your list local models</label>
      <section class="section-list-models">
        ${inputModels}
      </section>

      <input class="input-save-model" type="submit" value="Save">
    </form>
    <script>
    vscode = acquireVsCodeApi();
    
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

export function deactivate() {}

