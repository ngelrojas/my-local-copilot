import * as vscode from "vscode";
import { ListModels } from "./services/listModels";
import { checkOllamaRunning } from "./modules/ollamaRunning";
import {
  OLLAMA_MSG_ERROR,
  OLLAMA_SETTING,
  OLLAMA_MSG_INFO,
} from "./constants/ollamaConstant";
import { OllamaViewProvider } from "./views/ollamaViewProvider";

import {completionKeys, apiTemperature, numPredict, promptWindowSize,
        responsePreview, responsePreviewMaxTokens, responsePreviewDelay,
        continueInline, updateVSConfig
} from "./autocomplete/config";

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
                break;
              case 'saveParameters':
                  const configParameters =
                      vscode.workspace.getConfiguration("mylocal-autocoder");
                    configParameters.update('max tokens predicted',message.value.maxTokensPredicted, vscode.ConfigurationTarget.Global);
                    configParameters.update('prompt window size',message.value.promptWindowSize, vscode.ConfigurationTarget.Global);
                    configParameters.update('completion keys',message.value.completionKeys, vscode.ConfigurationTarget.Global);
                    configParameters.update('response preview',message.value.responsePreview, vscode.ConfigurationTarget.Global);
                    configParameters.update('preview max tokens',message.value.previewMaxTokens, vscode.ConfigurationTarget.Global);
                    configParameters.update('preview delay',message.value.previewDelay, vscode.ConfigurationTarget.Global);
                    configParameters.update('continue inline',message.value.continueInline, vscode.ConfigurationTarget.Global);
                    configParameters.update('temperature',message.value.temperature, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage('Parameters saved successfully!');
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
    <main>
    
        <div class="relative mx-auto min-h-screen max-w-3xl text-gray-300">
          <div class="flex p-4 gap-x-4">
            <div class="flex w-1/3 flex-col gap-y-2 border p-2">
              <div data-tab-id="models" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500 active">${OLLAMA_SETTING.MENU.MODEL}</div>
              <div data-tab-id="parameters" class="tab bg-gray-600 px-2 leading-loose hover:cursor-pointer hover:bg-gray-500">${OLLAMA_SETTING.MENU.PARAMETERS}</div>
            </div>
    
    <div class="flex-grow border p-2 pl-10 text-sm">
      <div class="tabContent flex flex-col gap-y-4" id="models">
        <div class="flex">
          <form class="form-save-model" id="settingsForm">
              <section class="section-list-models-">
                ${ListInputModels}
              </section>
              <button type="submit" class="input-save-model bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">save</button>
          </form>
        </div>  
      </div>
      
      <div class="tabContent hidden" id="parameters">
          <form id="parametersForm">
            <div class="flex py-2">
               <span class="basis-1/3 whitespace-nowrap">${OLLAMA_SETTING.SUB_MENU.NUMBER_PREDICTION}</span>
              <label for="numPredict" class="relative inline-flex cursor-pointer items-center">
                <input id="numPredict" type="number" value=${numPredict} min="1000" name="numPredict" class="text-black p-1 rounded ml-10" />
              </label>
            </div>
            <div class="flex py-2">
                <span class="basis-1/3 whitespace-nowrap">${OLLAMA_SETTING.SUB_MENU.WIN_SIZE}</span>
                <label for="promptWindowSize" class="relative inline-flex cursor-pointer items-center">
                    <input id="promptWindowSize" type="number" value=${promptWindowSize} min="2048" name="promptWindowSize" class="text-black p-1 ml-10 rounded" />
                </label>
            </div>
            <div class="flex py-2">
                <span class="basis-1/3 whitespace-nowrap">${OLLAMA_SETTING.SUB_MENU.KEY_COMPLETION}</span>
                <label for="completionKeys" class="relative inline-flex cursor-pointer items-center">
                    <input id="completionKeys" type="text" value=${JSON.stringify(completionKeys)}  name="completionKeys" class="text-black p-1 rounded ml-10" />
                </label>
            </div>
            <div class="flex py-2">
                <span class="basis-1/3 whitespace-nowrap">${OLLAMA_SETTING.SUB_MENU.PREVIEW}</span>
                <label for="responsePreview" class="relative inline-flex cursor-pointer items-center">    
                    <input id="responsePreview" type="checkbox"  name="responsePreview" class="ml-10 p-2" ${ responsePreview ? 'checked' : ''} />
                </label>
            </div>
            <div class="flex py-2">
                <span class="basis-1/3 whitespace-nowrap">${OLLAMA_SETTING.SUB_MENU.MAX_TOKENS}</span>
                <label for="responsePreviewMaxTokens" class="relative inline-flex cursor-pointer items-center">
                    <input id="responsePreviewMaxTokens" type="number" value=${responsePreviewMaxTokens} min="50"  name="responsePreviewMaxTokens" class="text-black p-1 rounded ml-10" />
                </label>
            </div>
            <div class="flex py-2">
                <span class="basis-1/3 whitespace-nowrap">${OLLAMA_SETTING.SUB_MENU.DELAY}</span>
                <label for="responsePreviewDelay" class="relative inline-flex cursor-pointer items-center">
                    <input id="responsePreviewDelay" type="number" value=${responsePreviewDelay} min="1"  name="responsePreviewDelay" class="text-black p-1 rounded ml-10" />
                </label>
            </div>
            <div class="flex py-2">
                <span class="basis-1/3 whitespace-nowrap">${OLLAMA_SETTING.SUB_MENU.INLINE}</span>
                <label for="continueInline" class="relative inline-flex cursor-pointer items-center">
                    <input id="continueInline" type="checkbox" name="continueInline" class="text-black p-1 ml-10 rounded" ${continueInline ? 'checked': ''} />
                </label>
            </div>
            <div class="flex py-2">
                <span class="basis-1/3 whitespace-nowrap">${OLLAMA_SETTING.SUB_MENU.TEMPERATURE}</span>
                <label for="apiTemperature" class="relative inline-flex cursor-pointer items-center">
                    <input id="apiTemperature" type="number" value=${apiTemperature} min="0.1" step="0.1" max="1" name="apiTemperature" class="text-black p-1 rounded ml-10" />
                </label>
            </div>
            <div class="flex py-2">
                <button type="submit" class="input-save-model bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">save</button>
            </div>
          </form>
      </div>
      
    </div>
  </div>
</div>

    </main>
  </body>
  </html>`;
}

export function deactivate() {}
