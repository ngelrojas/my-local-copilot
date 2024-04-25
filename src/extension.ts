import * as vscode from "vscode";
import { ListModels } from "./services/listModels";
import { checkOllamaRunning } from "./modules/ollamaRunning";
import {
  OLLAMA_MSG_ERROR,
  OLLAMA_SETTING,
  OLLAMA_MSG_INFO,
} from "./constants/ollamaConstant";

import { OllamaViewProvider } from "./views/ollamaViewProvider";
import { OllamaViewSettingsProvider} from "./views/ollamaViewSettingsProvider";

export function activate(context: vscode.ExtensionContext) {

  const provider = new OllamaViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("ollama-chat-pilot", provider)
  );

  checkOllamaRunning();

  const settingsProvider = new OllamaViewSettingsProvider(context);
  context.subscriptions.push(
      vscode.commands.registerCommand("my-local-copilot.openSettings", async ()=>{
        const panel = vscode.window.createWebviewPanel(
            "myExtensionSettings",
            "Settings",
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        //TODO: is not render files css and js
        panel.webview.html = await settingsProvider._getWebviewContent(panel.webview);
      })
  );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand(
  //     "my-local-copilot.openSettings",
  //     async () => {
  //       const panel = vscode.window.createWebviewPanel(
  //         "myExtensionSettings",
  //         OLLAMA_SETTING.TITLES.SETTINGS,
  //         vscode.ViewColumn.One,
  //         { enableScripts: true }
  //       );
  //
  //       panel.webview.html = await getWebviewContent();
  //
  //       panel.webview.onDidReceiveMessage(
  //         (message) => {
  //           switch (message.command) {
  //             case "save":
  //               const config =
  //                 vscode.workspace.getConfiguration("my-local-copilot");
  //               config
  //                 .update(
  //                   "model",
  //                   message.value,
  //                   vscode.ConfigurationTarget.Global
  //                 )
  //                 .then(() => {
  //                   vscode.window.showInformationMessage(
  //                     `${OLLAMA_MSG_INFO.MODEL_SET_TO} ${message.value}`
  //                   );
  //                 });
  //
  //               return;
  //           }
  //         },
  //         undefined,
  //         context.subscriptions
  //       );
  //     }
  //   )
  // );

}

// async function getWebviewContent() {
//   let inputModels = "";
//
//   try {
//
//     const response = await ListModels();
//
//     if (response.models.length === 0) {
//       vscode.window.showInformationMessage(
//         `${OLLAMA_MSG_INFO.MODEL_FOUND} ${response.models.length}`
//       );
//       vscode.window.showInformationMessage(OLLAMA_MSG_INFO.MODEL_NOT_FOUND);
//       return "";
//     }
//
//     const config = vscode.workspace.getConfiguration("my-local-copilot");
//     const modelStored = config.get("model") as string;
//
//     response.models.forEach((model: any) => {
//       let modelName = model.model.split(":")[0];
//       if(modelStored === modelName){
//         inputModels += `<label id="model-name" class="label-model-input" for=${modelName}><input type="radio" id=${modelName} name="model" checked> ${modelName}</label>`;
//       }else{
//         inputModels += `<label id="model-name" class="label-model-input" for=${modelName}><input type="radio" id=${modelName} name="model"> ${modelName}</label>`;
//       }
//     });
//
//   } catch (e) {
//     vscode.window.showErrorMessage(OLLAMA_MSG_ERROR.OLLAMA_NOT_RUNNING);
//     console.error(e);
//   }
//
//   return `<!DOCTYPE html>
//   <html lang="en">
//   <style>
//     .label-model-input{
//       display: block;
//       margin: 10px 0;
//     }
//     .label-title-model{
//       display: block;
//       margin: 10px 0;
//     }
//     .form-save-model{
//       display: block;
//       flex-direction: column;
//       margin: 10px 0;
//     }
//     .label-second-title{
//       display: block;
//       margin: 10px 0;
//     }
//     .section-list-models{
//       display: block;
//       margin: 10px;
//     }
//     .input-save-model{
//       display: block;
//       margin: 10px 0;
//     }
//   </style>
//   <body>
//     <form class="form-save-model" id="settingsForm">
//       <label class="label-title-model" for="mySetting">${OLLAMA_SETTING.TITLES.MODEL_LIST}</label>
//       <label class="label-second-title" for="second-title">below is your list local models</label>
//       <section class="section-list-models">
//         ${inputModels}
//       </section>
//
//       <input class="input-save-model" type="submit" value="Save">
//     </form>
//
//     <script>
//       const vscode = acquireVsCodeApi();
//
//       document.getElementById('settingsForm').addEventListener('submit', (event) => {
//         event.preventDefault();
//
//         let selectedModels = '';
//         const radios = document.querySelectorAll('input[name="model"]');
//
//         radios.forEach((radio) => {
//           if(radio.checked){
//             selectedModels = radio.parentElement.textContent.trim();
//           }
//         });
//
//         vscode.postMessage({
//           command: 'save',
//           value: selectedModels,
//         });
//       });
//
//     </script>
//   </body>
//   </html>`;
// }

export function deactivate() {}

