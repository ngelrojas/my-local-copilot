import * as vscode from "vscode";

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
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  public _getHtmlForWebview(webview: vscode.Webview) {
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "src/media", "main.css")
    );

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href='${stylesMainUri}' rel="stylesheet">
      <title>Ollama Chatbot</title>
    </head>
    <body>
      <main>
      
        <section class="wrap-ollama-section">
        
          <section class="ollama-section-request" id="req-ollama-bot-view">
            <!-- display message user request -->
          </section>
          
          <section class="ollama-section-response" id="res-ollama-bot-view">
            <!-- display message from ollama-bot-model response -->
            response from ollama-bot-model
          </section>
          
        </section>
        
        <section class="wrap-ollama-input-btn">
          <input class="req-input" id="send-req-ollama-bot" type="text" placeholder="Type your message here">
          <button class="req-btn" id="send">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="darkblue" d="m12.815 12.197l-7.532 1.255a.5.5 0 0 0-.386.318L2.3 20.728c-.248.64.421 1.25 1.035.942l18-9a.75.75 0 0 0 0-1.341l-18-9c-.614-.307-1.283.303-1.035.942l2.598 6.958a.5.5 0 0 0 .386.318l7.532 1.255a.2.2 0 0 1 0 .395"/></svg>
          </button>
        </section>
        
      </main>

      <script>
        document.getElementById('send').addEventListener('click', () => {
          const input = document.getElementById('send-req-ollama-bot');
          const chatbox = document.getElementById('req-ollama-bot-view');
          chatbox.innerHTML += '<p>You: ' + input.value + '</p>';
          input.value = '';
        });
      </script>
    </body>
    </html>`;
  }
}
