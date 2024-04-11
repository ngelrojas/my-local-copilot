// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from "vscode";
import { loadChat } from "./app";
import { ListModels } from "./services/listModels";
// import * as fs from "fs";
// import * as path from "path";

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

  context.subscriptions.push(
    vscode.commands.registerCommand("my-local-copilot.openSettings", () => {
      const panel = vscode.window.createWebviewPanel(
        "myExtensionSettings",
        "My local Copilot Settings",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      (async () => {
        panel.webview.html = await getWebviewContent();
      })();

      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "save":
              const config =
                vscode.workspace.getConfiguration("my-local-copilot");
              for (let model in message.value) {
                config.update(
                  model,
                  message.value[model],
                  vscode.ConfigurationTarget.Global
                );
              }

              return;
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );
}

async function getWebviewContent() {
  let inputModels = "";
  try {
    const response = await ListModels();
    response.models.forEach((model: any) => {
      let modelValue = model.model.split(":")[0];
      inputModels += `<label class="label-model-input"><input type="radio" id="model-llm" name="model"> ${modelValue}</label>`;
    });
  } catch (e) {
    vscode.window.showInformationMessage(`${e}`);
  }
  return `<!DOCTYPE html>
  <html lang="en">
  <style>
    .label-model-input{
      display: block;
      margin: 10px 0;
    }
  </style>
  <body>
    <form id="settingsForm">
      <label for="mySetting">Model List:</label><br>

      ${inputModels}
      

      <input type="submit" value="Save">
    </form>

    <script>
      const vscode = acquireVsCodeApi();

      document.getElementById('settingsForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const radios = document.querySelectorAll('input[type="radio"]');
        let selectedModels = {};
        radios.forEach((radio) => {
          
            selectedModels = radio.nextSibling.textContent.trim();
          
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
// This method is called when your extension is deactivated
export function deactivate() {}
