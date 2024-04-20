import ollama from "ollama";

interface userRequest {
  question: string;
  code: string;
}

export const OllamaChat = async (inputModel: String, inputMsg: userRequest) => {
  const response = await ollama.chat({
    model: `${inputModel}`,
    messages: [
      {
        role: "user",
        content: `${inputMsg.question} ${inputMsg.code}`,
      },
    ],
  });

  return response.message.content;
};
