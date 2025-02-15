import * as vscode from "vscode";
import ollama from "ollama";

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

  vscode.window.showInformationMessage(response.message.content);
};
