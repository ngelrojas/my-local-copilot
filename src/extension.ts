// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from "vscode";
import { loadChat } from "./app";
import { ListModels } from "./services/listModels";
import { checkOllamaRunning } from "./modules/ollamaRunning";
import {
  OLLAMA_MSG_ERROR,
  OLLAMA_SETTING,
  OLLAMA_MSG_INFO,
} from "./constants/ollamaConstant";
// import { OllamaDataProvider } from "./views/ollamaDataProvider";
import { OllamaViewProvider } from "./views/ollamaViewProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // register a tree view
  const provider = new OllamaViewProvider(context.extensionUri);
  const view = vscode.window.registerWebviewViewProvider(
    "ollama-chat-pilot.view",
    provider
  );

  context.subscriptions.push(view);
  // const ollamaDataProvider = new OllamaDataProvider();
  // vscode.window.registerTreeDataProvider(
  //   "ollama-chat-pilot.view",
  //   ollamaDataProvider
  // );

  // const activateCommand = vscode.commands.registerCommand(
  //   "ollama-chat-pilot.activate",
  //   () => {
  //     vscode.window.showInformationMessage("Ollama Chat Pilot Activated!");
  //     ollamaDataProvider.displayAllItems();
  //   }
  // );
  // const activateViewCommand = vscode.commands.registerCommand(
  //   "ollama-chat-pilot.view",
  //   () => {
  //     vscode.window.showInformationMessage("My View Activated!");
  //     ollamaDataProvider.displayAllItems();
  //   }
  // );
  // context.subscriptions.push(activateCommand, activateViewCommand);
  // context.subscriptions.push(
  //   vscode.commands.registerCommand("ollama-chat-pilot.openChat", async () => {
  //     const panel = vscode.window.createWebviewPanel(
  //       "ollamaChatbot", // Identifies the type of the webview. Used internally
  //       "Ollama Chatbot", // Title of the panel displayed to the user
  //       vscode.ViewColumn.One, // Editor column to show the new webview panel in.
  //       {} // Webview options. More on these later.
  //     );
  //     panel.webview.html = await getWebviewOllamaChatPilot();
  //   })
  // );
  // vscode.commands.executeCommand("ollama-chat-pilot.openChat");
  //
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
        const config = vscode.workspace.getConfiguration("my-local-copilot");
        const model = config.get("model") as string;

        loadChat(model, userInput + text);
      }

      checkOllamaRunning();
    }
  );

  context.subscriptions.push(disposable);

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

        panel.webview.html = await getWebviewContent();

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
}

async function getWebviewContent() {
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

    response.models.forEach((model: any) => {
      let modelName = model.model.split(":")[0];
      inputModels += `<label id="model-name" class="label-model-input" for="model-llm"><input type="radio" id="model-llm" name="model"> ${modelName}</label>`;
    });
  } catch (e) {
    vscode.window.showErrorMessage(OLLAMA_MSG_ERROR.OLLAMA_NOT_RUNNING);
    console.error(e);
  }

  return `<!DOCTYPE html>
  <html lang="en">
  <style>
    .label-model-input{
      display: block;
      margin: 10px 0;
    }
    .label-title-model{
      display: block;
      margin: 10px 0;
    }
    .form-save-model{
      display: block;
      flex-direction: column;
      margin: 10px 0;
    }
    .label-second-title{
      display: block;
      margin: 10px 0;
    }
    .section-list-models{
      display: block;
      margin: 10px;
    }
    .input-save-model{
      display: block;
      margin: 10px 0;
    }
  </style>
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
// ollama-chat-pilot interface ui
async function getWebviewOllamaChatPilot() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ollama Chatbot</title>
    </head>
    <body>
      <h1>Ollama Chatbot</h1>
      <div id="chatbox">
        <!-- Chat messages will be added here -->
      </div>
      <input id="input" type="text" placeholder="Type your message here">
      <button id="send">Send</button>

      <script>
        document.getElementById('send').addEventListener('click', () => {
          const input = document.getElementById('input');
          const chatbox = document.getElementById('chatbox');
          chatbox.innerHTML += '<p>You: ' + input.value + '</p>';
          input.value = '';
        });
      </script>
    </body>
    </html>`;
}
// This method is called when your extension is deactivated
export function deactivate() {}
