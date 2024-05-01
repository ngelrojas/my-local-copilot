import ollama from "ollama";

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
  });

  conversationHistory.push(
    {
      role: "assistant",
      content: response.message.content,
    },
  );

  return response.message.content;
};
