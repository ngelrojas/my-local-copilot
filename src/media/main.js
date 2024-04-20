(function () {
  const vscode = acquireVsCodeApi();

  document.addEventListener("DOMContentLoaded", (event) => {
    let counter = 0;

    const sendButton = document.getElementById("send");
    if (sendButton) {
      sendButton.addEventListener("click", () => {
        counter++;
        const requestInput = document.getElementById("send-req-ollama-bot");

        vscode.postMessage({ command: "send", text: requestInput.value });

        const wrapConversation = document.createElement("div");
        wrapConversation.id=`wrap-ollama-conversation-${counter}`;
        wrapConversation.className="wrap-ollama-conversation";

        const userRequestIn = document.createElement("section");
        userRequestIn.id = `req-ollama-bot-view-${counter}`;
        userRequestIn.className = "o-section-request border-t border-x pt-0.5 pb-1 px-1.5";

        const groupBtnDelCpy = document.createElement("div");
        groupBtnDelCpy.id=`btn-del-cpy-${counter}`;
        groupBtnDelCpy.className="btn-del-cpy flex flex-row justify-end";

        const btnDel = document.createElement("button");
        btnDel.id=`btn-del-${counter}`;
        btnDel.className="btn-del rounded bg-gray-400 p-1";
        btnDel.textContent="delete";
        btnDel.dataset.counter = counter;

        const btnCpy = document.createElement("button");
        btnCpy.id=`btn-cpy-${counter}`;
        btnCpy.className="btn-cpy rounded bg-gray-400 p-1";
        btnCpy.textContent="copy";
        btnCpy.dataset.counter = counter;

        document.getElementById("wrap-ollama-section").appendChild(wrapConversation);
        document.getElementById(`wrap-ollama-conversation-${counter}`).appendChild(userRequestIn);
        document.getElementById(`req-ollama-bot-view-${counter}`).appendChild(groupBtnDelCpy);
        document.getElementById(`btn-del-cpy-${counter}`).appendChild(btnDel);
        document.getElementById(`btn-del-cpy-${counter}`).appendChild(btnCpy);
        userRequestIn.innerHTML += "<p>You: " + requestInput.value + "</p>";
        requestInput.value = "";

        const actionBtnDel = document.getElementById(`btn-del-${counter}`);
        actionBtnDel.addEventListener("click", (event) => {
          const counterValue = event.target.dataset.counter;
          document.getElementById(`wrap-ollama-conversation-${counterValue}`).remove();
        });

        const actionBtnCpy = document.getElementById(`btn-cpy-${counter}`);
        actionBtnCpy.addEventListener("click", (event) => {
          const counterValue = event.target.dataset.counter;
          const cpyText = document.getElementById(`req-ollama-bot-view-${counterValue}`).textContent;
          navigator.clipboard.writeText(cpyText).then(function () {
            console.log('Async: Copying to clipboard was successful!');
          }, function (err) {
            console.error('Async: Could not copy text: ', err);
          });
        });

      });

    }

    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.command) {
        case "response":
          const botResponse = document.createElement("section");

          const groupBtnCpyMsg = document.createElement("div");
          groupBtnCpyMsg.id=`group-btn-cpy-msg-${counter}`;
          groupBtnCpyMsg.className="group-btn-cpy-msg flex justify-between";

          const botAvatar = document.createElement("div");
          botAvatar.id=`bot-avatar-${counter}`;
          botAvatar.className="bot-avatar";
          botAvatar.textContent="🤖";

          const btnCpyMsg = document.createElement("button");
          btnCpyMsg.id=`btn-cpy-msg-${counter}`;
          btnCpyMsg.className="btn-cpy-msg rounded bg-gray-400 p-1";
          btnCpyMsg.textContent="copy";
          btnCpyMsg.dataset.counter = counter;

          botResponse.id = `res-ollama-bot-view-${counter}`;
          botResponse.className = "o-section-response border-x border-b pt-1 pb-0.5 px-1.5 mb-1";
          document.getElementById(`wrap-ollama-conversation-${counter}`).appendChild(botResponse);
          document.getElementById(`res-ollama-bot-view-${counter}`).appendChild(groupBtnCpyMsg);
          document.getElementById(`group-btn-cpy-msg-${counter}`).appendChild(botAvatar);
          document.getElementById(`group-btn-cpy-msg-${counter}`).appendChild(btnCpyMsg);
          botResponse.innerHTML += `<p id="res-current-bot-o-${counter}">${message.text}</p>`;

          const actionBtnCpyMsg = document.getElementById(`btn-cpy-msg-${counter}`);
          actionBtnCpyMsg.addEventListener("click", (event) => {
            const counterValue = event.target.dataset.counter;
            const cpyTextMsg = document.getElementById(`res-current-bot-o-${counterValue}`).textContent;
            navigator.clipboard.writeText(cpyTextMsg).then(function () {
              console.log('Async: Copying to clipboard was successful!');
            }, function (err) {
              console.error('Async: Could not copy text: ', err);
            });
          });
          break;
      }
    });

  });
})();
