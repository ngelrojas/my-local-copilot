// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from "vscode";
import { loadChat } from "./app";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "my-local-copilot.app",
    async () => {
      const editor = vscode.window.activeTextEditor;
      let text = "";

      if (editor) {
        let document = editor.document;
        let selection = editor.selection;
        text = document.getText(selection);
        // TODO: working well, but the completion code not working well
        // need to fix the completion code, and text + userInput

        // loadChat("mistral", text);
      }

      let userInput = await vscode.window.showInputBox({
        prompt: "Please enter your message",
      });

      if (userInput) {
        loadChat("mistral", userInput + text);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
