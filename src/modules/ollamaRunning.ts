import * as vscode from "vscode";
import { checkOllamaRunningApi } from "../services/ollamaRunApi";
import { OLLAMA_MSG_ERROR } from "../constants/ollamaConstant";

//TODO: console.info = for future logging files, I mean, replace console,.info to logging file instead of.
//TODO: console.error = the same as above, with date and time.

export const checkOllamaRunning = async () => {
  try {
    const isOllamaRunningApi = await checkOllamaRunningApi();
    console.info(isOllamaRunningApi);
  } catch (e) {
    vscode.window.showErrorMessage(
      OLLAMA_MSG_ERROR.OLLAMA_NOT_OR_NOT_INSTALLED
    );
    console.error(e);
  }
};
