import { exec } from "child_process";

export function checkOllamaRunning(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exec('ps aux | grep "[o]llama"', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        resolve(
          stdout
            .toLowerCase()
            .includes(
              "/applications/ollama.app/contents/resources/ollama serve"
            )
        );
      }
    });
  });
}
