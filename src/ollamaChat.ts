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

  return response.message.content;
};
