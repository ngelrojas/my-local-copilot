export const OLLAMA_LOCALHOST = "http://localhost:11434";
export const OLLAMA_RESPONSE_DATA = "Ollama is running";
export const OLLAMA_ON = {
  DATA: "data",
  END: "end",
  ERROR: "error",
};

export const OLLAMA_MSG_INFO = {
  MODEL_FOUND: "Models found: ",
  MODEL_NOT_FOUND:
    "Please ensure that you pull the models from the Ollama server.\nYou can do this by running the command 'ollama pull <MODEL_NAME>' in your terminal.\n check documentation for more information.",
  MODEL_SET_TO: "Model set to: ",
};

export const OLLAMA_MSG_ERROR = {
  OLLAMA_NOT_RUNNING: "Failed: Ollama is not running",
  OLLAMA_NOT_OR_NOT_INSTALLED:
    "Failed to check if Ollama is running. Please ensure Ollama is installed and check if Ollama serve is running, try again.",
};
