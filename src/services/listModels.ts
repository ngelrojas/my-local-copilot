import ollama from "ollama";

export const ListModels = async () => {
  return await ollama.list();
};
