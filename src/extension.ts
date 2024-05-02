import * as vscode from "vscode";
import { ListModels } from "./services/listModels";
import { checkOllamaRunning } from "./modules/ollamaRunning";
import {
  OLLAMA_MSG_ERROR,
  OLLAMA_SETTING,
  OLLAMA_MSG_INFO,
} from "./constants/ollamaConstant";
import { OllamaViewProvider } from "./views/ollamaViewProvider";

import {completionKeys, updateVSConfig} from "./autocomplete/config";

import { autocompleteCommand } from "./autocomplete/command";
import { provideCompletionItems } from "./autocomplete/provider";

updateVSConfig();

vscode.workspace.onDidChangeConfiguration(updateVSConfig);

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

    const completionProvider = vscode.languages.registerCompletionItemProvider("*", {
            provideCompletionItems
        },
        ...completionKeys.split("")
    );

    const externalAutocompleteCommand = vscode.commands.registerTextEditorCommand(
        "mylocal-autocoder.autocomplete",
        (textEditor, _, cancellationToken?) => {
            autocompleteCommand(textEditor, cancellationToken);
        }
    );

    context.subscriptions.push(completionProvider);
    context.subscriptions.push(externalAutocompleteCommand);

}

async function retrieveModelList(inputModels: string) {


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
                inputModels += `<label id="model-name" class="label-model-input" for=${modelName}><input type="radio" id=${modelName} name="model" /> ${modelName}</label>`;

            }
        });

        return inputModels;

    } catch (e) {
        vscode.window.showErrorMessage(OLLAMA_MSG_ERROR.OLLAMA_NOT_RUNNING);
        console.error(e);
    }
}

async function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext) {
    const stylesTailwindCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src/media", "tailwind.min.css")
    );
    const stylesSettingsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src/media", "ollamaSettings.css")
    );
    const scriptTailwindJsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src/media", "tailwindcss.3.2.4.min.js")
    );
    const scriptSettingsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "src/media", "ollamaSettings.js")
    );

    let inputModels = "";
    let ListInputModels = await retrieveModelList(inputModels);

  return `<!DOCTYPE html>
  <html lang="en">
      <head>
        <link href='${stylesTailwindCssUri}' rel="stylesheet" />
        <link href='${stylesSettingsUri}' rel="stylesheet" />
       <script src="${scriptTailwindJsUri}"></script>
       <script src="${scriptSettingsUri}"></script>
        <title>${OLLAMA_SETTING.TITLES.SETTINGS}</title>
    </head>
  
  <body>
    
<!--    tabs begging-->
<div class="relative mx-auto min-h-screen max-w-3xl text-gray-300">
  <div class="flex p-4 gap-x-4">
    <div class="flex w-1/3 flex-col gap-y-2 border p-2">
      <div data-tab-id="models" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500 active">${OLLAMA_SETTING.MENU.MODEL}</div>
      <div data-tab-id="parameters" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">${OLLAMA_SETTING.MENU.PARAMETERS}</div>
<!--      <div data-tab-id="performance" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">Performance Chart</div>-->
<!--      <div data-tab-id="holdings" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">Top Holdings</div>-->
<!--      <div data-tab-id="interest" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">Short Interest</div>-->
<!--      <div data-tab-id="analyst" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">Current Analyst Rating</div>-->
<!--      <div data-tab-id="regional" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">Regional Volume</div>-->
<!--      <div data-tab-id="nethouse" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">Net House Summary</div>-->
<!--      <div data-tab-id="history" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">History</div>-->
    </div>
    <div class="flex-grow border p-2 pl-10 text-sm">
      <div class="tabContent flex flex-col gap-y-4" id="models">
      
        <div class="mb-4 text-lg">${OLLAMA_SETTING.TITLES.MODEL_LIST}</div>
        <div class="flex">
          <form class="form-save-model" id="settingsForm">
              <section class="section-list-models-">
                ${ListInputModels}
              </section>
              <input class="input-save-model bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" type="submit" value="Save">
          </form>
        </div>
        
<!--        <div class="flex"><span class="basis-1/3">Color:</span><input type="color" name="color" class="px-2 py-1" /></div>-->
<!--        <div class="flex">-->
<!--          <span class="basis-1/3 whitespace-nowrap">All Sections included:</span>-->
<!--          <label for="profile-toggle" class="relative inline-flex cursor-pointer items-center">-->
<!--            <input id="profile-toggle" type="checkbox" value="on" name="profile" class="peer sr-only" />-->
<!--            <div class="peer h-4 w-9 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-gray-800 after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:border-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>-->
<!--            <span class="font-mediumm ml-3 text-sm dark:text-gray-300">On</span>-->
<!--          </label>-->
<!--        </div>-->
        
      </div>
      <div class="tabContent hidden" id="parameters">
        <div class="mb-4 text-lg">${OLLAMA_SETTING.SUB_MENU.TOKENS}</div>
      </div>
<!--      <div class="tabContent hidden" id="performance">performance options</div>-->
<!--      <div class="tabContent hidden" id="holdings">holdings options</div>-->
<!--      <div class="tabContent hidden" id="interest">interest options</div>-->
<!--      <div class="tabContent hidden" id="analyst">analyst options</div>-->
<!--      <div class="tabContent hidden" id="regional">regional options</div>-->
<!--      <div class="tabContent hidden" id="nethouse">nethouse options</div>-->
<!--      <div class="tabContent hidden" id="history">history options</div>-->
    </div>
  </div>
</div>
<!--tabs end-->
    
  </body>
  </html>`;
}

export function deactivate() {}
