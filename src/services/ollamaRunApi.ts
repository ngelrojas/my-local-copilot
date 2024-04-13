import * as http from "http";
import {
  OLLAMA_LOCALHOST,
  OLLAMA_RESPONSE_DATA,
  OLLAMA_ON,
} from "../constants/ollamaConstant";

export async function checkOllamaRunningApi(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    http
      .get(OLLAMA_LOCALHOST, (res) => {
        let data = "";

        res.on(OLLAMA_ON.DATA, (chunk) => {
          data += chunk;
        });

        res.on(OLLAMA_ON.END, () => {
          if (data === OLLAMA_RESPONSE_DATA) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      })
      .on(OLLAMA_ON.ERROR, (err) => {
        reject(err);
      });
  });
}
