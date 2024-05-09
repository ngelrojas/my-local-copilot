import * as vscode from "vscode";
import { OllamaChat } from "../services/ollamaChat";

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
               let conversationHistory:any = [];
              const userRequest = {
                question: userQuestion,
                code: codeSelected,
              };
              const response = await OllamaChat(model, userRequest, conversationHistory);
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
    const svgSend = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="fill-gray-400" d="m12.815 12.197l-7.532 1.255a.5.5 0 0 0-.386.318L2.3 20.728c-.248.64.421 1.25 1.035.942l18-9a.75.75 0 0 0 0-1.341l-18-9c-.614-.307-1.283.303-1.035.942l2.598 6.958a.5.5 0 0 0 .386.318l7.532 1.255a.2.2 0 0 1 0 .395"/></svg>`;
    const svgDelete = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href='${stylesTailwindCssUri}' rel="stylesheet" />
        <link href='${stylesMainUri}' rel="stylesheet" />
        <script src='${scriptTailwindJsUri}'></script>
        <script src='${scriptMainUri}'></script>
        <title>Ollama Chatbot</title>
      </head>
      <body>
        <main>
        
            <div class="relative wrap-ol">
            
              <div class="overflow-scroll mb-12 wrapp-all-conversation-ollama">
                  <div class="sticky top-0 flex justify-end bg-slate-800 p-2 btn-options-ollama" id="del-all-chats">
                      <button class="del-all-chats">${svgDelete}</button>
                  </div>
                  <section class="wrap-ollama-section mt-8" id="wrap-ollama-section">
                  </section>
              </div>
              
              
              <div class="absolute bottom-0 w-full flex flex-row my-0.5" id="chatForm">
                <textarea class="p-1 text-black w-full rounded-l-sm text-dynamic" name="" id="send-req-ollama-bot" placeholder="Type your message here" cols="30"></textarea>
                
                <button class="p-1 bg-slate-400 w-1/7 flex justify-center items-center rounded-r-sm" id="send">
                    ${svgSend}
                </button>
              </div>
              
            </div>
 
        </main>      
      </body>
      </html>`;
  }
}












