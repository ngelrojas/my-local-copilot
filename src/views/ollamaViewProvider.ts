// import * as vscode from "vscode";

// export class OllamaViewProvider implements vscode.WebviewViewProvider {
//   private _view?: vscode.WebviewView;

//   constructor(private readonly _context: vscode.ExtensionContext) {}

//   public resolveWebviewView(
//     webviewView: vscode.WebviewView
//     // context: vscode.WebviewViewResolveContext,
//     // token: vscode.CancellationToken
//   ) {
//     this._view = webviewView;
//     webviewView.webview.options = {
//       enableScripts: true,
//     };
//     webviewView.webview.html = "<h1>Hello, Ollama!</h1>";
//   }

//   public displayAllItems(): void {
//     this._view?.webview.postMessage({
//       command: "displayAllItems",
//       items: [{ label: "Item 1" }, { label: "Item 2" }],
//     });
//   }
// }

import * as vscode from "vscode";

export class OllamaViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // You can return your HTML content here
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Ollama Chat Pilot</title>
            </head>
            <body>
                <h1>Welcome to Ollama Chat Pilot!</h1>
            </body>
            </html>`;
  }
}
