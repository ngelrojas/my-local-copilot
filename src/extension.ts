// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

//TODO:
// 1. create a config file for ollama
// 1.2 read a api from ollama
// 1.3 list all models from ollama
// 2. integrating ollama(models) with vscode

import * as vscode from "vscode";
import { loadChat } from "./app";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "my-local-copilot" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "my-local-copilot.app",
    async () => {
      let userInput = await vscode.window.showInputBox({
        prompt: "Please enter your message",
      });
      if (userInput) {
        loadChat("mistral", userInput);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
