import * as http from "http";

export async function checkOllamaRunningApi(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    http
      .get("http://localhost:11434/", (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (data === "Ollama is running") {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
