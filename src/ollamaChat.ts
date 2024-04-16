import * as vscode from "vscode";
import ollama from "ollama";

// TODO: check output response from ollama.chat
export const OllamaChat = async (inputModel: String, inputMsg: String) => {
  const response = await ollama.chat({
    model: `${inputModel}`,
    messages: [
      {
        role: "user",
        content: `${inputMsg}`,
      },
    ],
  });

  // vscode.window.visibleTextEditors.forEach((editor) => {
  //   editor.edit((editBuilder) => {
  //     editBuilder.insert(
  //       editor.selection.active,
  //       `\n${response.message.content}`
  //     );
  //   });
  // });
  return response.message.content;
};
