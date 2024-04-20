import ollama from "ollama";

export const ListModels = async () => {
  const response = await ollama.list();
  return response;
};
