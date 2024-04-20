import * as vscode from "vscode";
import { loadChat } from "./app";
import { ListModels } from "./services/listModels";
import { checkOllamaRunningApi } from "./services/ollamaRunApi";
//TODO: import ollamaConstant

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
        const config = vscode.workspace.getConfiguration("my-local-copilot");
        const model = config.get("model") as string;

        loadChat(model, userInput + text);
      }
      // check if ollama is running
      // console.info = for future logging files, I mean, replace console,.info to logging file instead of.
      // console.error = the same as above, with date and time.
      try {
        const isOllamaRunningApi = await checkOllamaRunningApi();
        console.info(isOllamaRunningApi);
      } catch (e) {
        vscode.window.showErrorMessage(
          `Failed to check if Ollama is running. Please ensure Ollama is installed and check if Ollama serve is running, try again.`
        );
        console.error(e);
      }
    }
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.commands.registerCommand("my-local-copilot.openSettings", () => {
      const panel = vscode.window.createWebviewPanel(
        "myExtensionSettings",
        "LLM Settings",
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
              config
                .update(
                  "model",
                  message.value,
                  vscode.ConfigurationTarget.Global
                )
                .then(() => {
                  vscode.window.showInformationMessage(
                    `Model set to ${message.value}`
                  );
                });

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

    if (response.models.length === 0) {
      vscode.window.showInformationMessage(
        `Models found: ${response.models.length}`
      );
      vscode.window.showInformationMessage(
        `Please ensure that you pull the models from the Ollama server.\n
        You can do this by running the command 'ollama pull <MODEL_NAME>' in the terminal.`
      );
      return "";
    }

    response.models.forEach((model: any) => {
      let modelName = model.model.split(":")[0];
      inputModels += `<label id="model-name" class="label-model-input" for="model-llm"><input type="radio" id="model-llm" name="model"> ${modelName}</label>`;
    });
  } catch (e) {
    vscode.window.showErrorMessage(`Failed: Ollama is not running`);
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
      <label class="label-title-model" for="mySetting">Model List:</label>
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
// This method is called when your extension is deactivated
export function deactivate() {}
