import ollama from "ollama";
import { numPredict, apiTemperature } from "../autocomplete/config";

interface userRequest {
  question: string;
  code: string;
}

interface Message {
  role: string;
  content: string;
}

export const OllamaChat = async (inputModel: String, inputMsg: userRequest, conversationHistory: Message[]) => {

  conversationHistory.push({
    role: "user",
    content: `${inputMsg.question} ${inputMsg.code}`,
  });

  const response = await ollama.chat({
    model: `${inputModel}`,
    messages: conversationHistory,
    options: {
        num_predict: numPredict,
        temperature: apiTemperature,
    },
  });

  conversationHistory.push(
    {
      role: "assistant",
      content: response.message.content,
    },
  );

  return response.message.content;
};
