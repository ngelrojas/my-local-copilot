(function () {
  const vscode = acquireVsCodeApi();

  document.addEventListener("DOMContentLoaded", (event) => {
    const sendButton = document.getElementById("send");
    if (sendButton) {
      sendButton.addEventListener("click", () => {
        const requestInput = document.getElementById("send-req-ollama-bot");
        vscode.postMessage({ command: "send", text: requestInput.value });

        const userRequestIn = document.createElement("section");
        userRequestIn.id = "req-ollama-bot-view";
        userRequestIn.className = "ollama-section-request py-0.5";
        document.getElementById("wrap-ollama-section").appendChild(userRequestIn);
        userRequestIn.innerHTML += "<p>You: " + requestInput.value + "</p>";
        requestInput.value = "";
      });
    }

    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.command) {
        case "response":
          const botResponse = document.createElement("section");
          botResponse.id = "res-ollama-bot-view";
          botResponse.className = "ollama-section-response py-0.5";
          document
            .getElementById("wrap-ollama-section")
            .appendChild(botResponse);
          botResponse.innerHTML += "<p>ollama-bot: " + message.text + "</p>";
          break;
      }
    });
  });
})();
