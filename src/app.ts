import * as vscode from "vscode";
import ollama from "ollama";
import { ListModels } from "./services/listModels";
// import { TransformListModels } from "./modules/transformListModels";

export const loadChat = async (inputModel: String, inputMsg: String) => {
  const response = await ollama.chat({
    model: `${inputModel}`,
    messages: [
      {
        role: "user",
        content: `${inputMsg}`,
      },
    ],
  });

  ListModels()
    .then((response: any) => {
      response.models.forEach((model: any) => {
        vscode.window.showInformationMessage(model);
      });
    })
    .catch((error: any) => {
      vscode.window.showInformationMessage(`${error}`);
    });

  vscode.window.visibleTextEditors.forEach((editor) => {
    editor.edit((editBuilder) => {
      editBuilder.insert(
        editor.selection.active,
        `${response.message.content}\n`
      );
    });
  });
};
