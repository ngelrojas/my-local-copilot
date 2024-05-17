(function () {
  const vscode = acquireVsCodeApi();
  const svgDelete = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>`;
  const svgCopy = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20"><path fill="currentColor" d="M6.644 2.983a.252.252 0 0 0-.253.252c0 .139.113.251.253.251h3.713c.14 0 .253-.112.253-.251a.252.252 0 0 0-.253-.252zm3.713-1.342c.734 0 1.353.49 1.544 1.16l2.175.001c.621.004 1.122.205 1.432.638c.266.372.372.85.345 1.387L15.85 17.84c.042.552-.062 1.04-.328 1.445c-.312.473-.821.71-1.452.716H3.14c-.76-.03-1.323-.209-1.675-.609c-.327-.371-.47-.88-.464-1.5V4.84c-.013-.6.154-1.106.518-1.48c.376-.384.932-.554 1.647-.559h1.935c.19-.67.809-1.16 1.543-1.16zm0 3.187H6.644c-.546 0-1.027-.27-1.317-.684H3.17c-.383.002-.602.07-.682.152c-.091.093-.144.252-.138.531v13.07c-.003.325.052.522.13.61c.054.061.286.135.685.151h10.9c.2-.002.28-.04.326-.109c.091-.138.133-.334.11-.658l.001-13.096c.014-.293-.027-.482-.096-.578c-.026-.035-.116-.072-.336-.073h-2.397c-.29.414-.771.684-1.317.684M17.2 0c.994 0 1.8.801 1.8 1.79v14.082c0 .988-.806 1.79-1.8 1.79h-1.958v-1.343h1.957c.249 0 .45-.2.45-.447V1.789a.449.449 0 0 0-.45-.447H9.643c-.248 0-.45.2-.45.447v.157h-1.35v-.157C7.843.801 8.649 0 9.643 0zM8.196 11.751c.373 0 .675.3.675.671c0 .37-.302.671-.675.671H4.145a.673.673 0 0 1-.676-.67c0-.371.303-.672.676-.672zm4.052-2.684c.372 0 .675.3.675.671c0 .37-.303.671-.675.671H4.145a.673.673 0 0 1-.676-.67c0-.371.303-.672.676-.672zm0-2.684c.372 0 .675.3.675.671a.673.673 0 0 1-.675.671H4.145a.673.673 0 0 1-.676-.67c0-.371.303-.672.676-.672z"/></svg>`;
  const svgUser = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M12 1.25a4.75 4.75 0 1 0 0 9.5a4.75 4.75 0 0 0 0-9.5M8.75 6a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0M12 12.25c-2.313 0-4.445.526-6.024 1.414C4.42 14.54 3.25 15.866 3.25 17.5v.102c-.001 1.162-.002 2.62 1.277 3.662c.629.512 1.51.877 2.7 1.117c1.192.242 2.747.369 4.773.369s3.58-.127 4.774-.369c1.19-.24 2.07-.605 2.7-1.117c1.279-1.042 1.277-2.5 1.276-3.662V17.5c0-1.634-1.17-2.96-2.725-3.836c-1.58-.888-3.711-1.414-6.025-1.414M4.75 17.5c0-.851.622-1.775 1.961-2.528c1.316-.74 3.184-1.222 5.29-1.222c2.104 0 3.972.482 5.288 1.222c1.34.753 1.961 1.677 1.961 2.528c0 1.308-.04 2.044-.724 2.6c-.37.302-.99.597-2.05.811c-1.057.214-2.502.339-4.476.339c-1.974 0-3.42-.125-4.476-.339c-1.06-.214-1.68-.509-2.05-.81c-.684-.557-.724-1.293-.724-2.601" clip-rule="evenodd"/></svg>`;
  const svgBot = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="currentColor" d="M17.753 14a2.25 2.25 0 0 1 2.25 2.25v.904A3.75 3.75 0 0 1 18.696 20c-1.565 1.344-3.806 2-6.696 2c-2.89 0-5.128-.656-6.69-2a3.75 3.75 0 0 1-1.306-2.843v-.908A2.25 2.25 0 0 1 6.254 14zm0 1.5h-11.5a.75.75 0 0 0-.75.75v.907c0 .655.287 1.278.784 1.706C7.545 19.945 9.441 20.5 12 20.5c2.56 0 4.458-.557 5.72-1.64a2.25 2.25 0 0 0 .783-1.707v-.905a.75.75 0 0 0-.75-.75M11.9 2.006L12 2a.75.75 0 0 1 .743.648l.007.102l-.001.749h3.5a2.25 2.25 0 0 1 2.25 2.25v4.505a2.25 2.25 0 0 1-2.25 2.25h-8.5a2.25 2.25 0 0 1-2.25-2.25V5.75A2.25 2.25 0 0 1 7.75 3.5l3.5-.001V2.75a.75.75 0 0 1 .649-.743L12 2zM16.25 5h-8.5a.75.75 0 0 0-.75.75v4.504c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75V5.75a.75.75 0 0 0-.75-.75m-6.5 1.5a1.25 1.25 0 1 1 0 2.498a1.25 1.25 0 0 1 0-2.498m4.492 0a1.25 1.25 0 1 1 0 2.498a1.25 1.25 0 0 1 0-2.498"/></svg>`;
  const svgResend = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m16.89 15.5l1.42 1.39c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.5M13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03m6.93-6.9a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47m-2.36-5.45L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10z"/></svg>`;

  document.addEventListener("DOMContentLoaded", (event) => {
    let counter = 0;

    const sendButton = document.getElementById("send");
    const requestInput = document.getElementById("send-req-ollama-bot");

    if (sendButton && requestInput) {
      sendButton.addEventListener("click", sendInfoChat);
      requestInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          sendInfoChat();
        }
      });
    }

    const removeAllChats = document.getElementById("del-all-chats");
    if (removeAllChats) {
      removeAllChats.addEventListener("click", (event) => {
        const wrapOllamaSection = document.getElementById(
          "wrap-ollama-section"
        );
        wrapOllamaSection.innerHTML = "";
      });
    }

    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.command) {
        case "response":
          document.getElementById(`loading-${counter}`).remove();
          const botResponse = document.createElement("section");
          botResponse.id = `res-ollama-bot-view-${counter}`;
          botResponse.className = "o-section-response border-x border-b pt-1 pb-0.5 px-1.5 mb-1";

          const groupBtnCpyMsg = document.createElement("div");
          groupBtnCpyMsg.id = `group-btn-cpy-msg-${counter}`;
          groupBtnCpyMsg.className = "group-btn-cpy-msg flex justify-between mb-1.5";

          const botAvatar = document.createElement("div");
          botAvatar.id = `bot-avatar-${counter}`;
          botAvatar.className = "bot-avatar";
          botAvatar.innerHTML = svgBot;

          const btnCpyMsg = document.createElement("button");
          btnCpyMsg.id = `btn-cpy-msg-${counter}`;
          btnCpyMsg.className = "btn-cpy-msg text-gray-500 opacity-50 hover:opacity-100 hover:text-slate-400 m-0.5";
          btnCpyMsg.title = "copy";
          btnCpyMsg.innerHTML = svgCopy;
          btnCpyMsg.setAttribute("data-counter", `${counter}`);


          document.getElementById(`wrap-ollama-conversation-${counter}`).appendChild(botResponse);
          document.getElementById(`res-ollama-bot-view-${counter}`).appendChild(groupBtnCpyMsg);
          document.getElementById(`group-btn-cpy-msg-${counter}`).appendChild(botAvatar);
          document.getElementById(`group-btn-cpy-msg-${counter}`).appendChild(btnCpyMsg);

          let _codeCounterGenerated = [];
          let formattedMessage = message.text.replace(
              /(<pre id='code-[^>]+)>/g,
            function (match, p1) {
              let _p1 = p1 + ">";
              _codeCounterGenerated.push(_p1);
              return `${match}`;
            }
          );

          formattedMessage = formattedMessage.replace(
            /<button data-counter=(\d+) id='cpy-pre-(\d+)'>/g,
            function (match) {
              return `${match}`;
            }
          );

          botResponse.innerHTML += `<div id="res-current-bot-o-${counter}">${formattedMessage}</div>`;

          const actionBtnCpyMsg = document.getElementById(
            `btn-cpy-msg-${counter}`
          );

          actionBtnCpyMsg.addEventListener("click", (event) => {
            let counterValue = btnCpyMsg.getAttribute("data-counter");
            const cpyTextMsg = document.getElementById(
              `res-current-bot-o-${counterValue}`
            ).textContent;
            navigator.clipboard.writeText(cpyTextMsg).then(
              function () {
                vscode.postMessage({ command: "copy", text: cpyTextMsg });
                console.info("Async: Copying to clipboard was successful!");
              },
              function (err) {
                console.error("Async: Could not copy text: ", err);
              }
            );
          });
          _codeCounterGenerated.map((id) => {
            let matchId = id.match(/code-([^>]+)(?=>)/);
            if (matchId && matchId[1]) {
              let uuid = matchId[1];
              if (uuid.endsWith("'")) {
                uuid = uuid.slice(0, -1);
              }
              addEventListenerToButton(uuid);
            }
          });

          break;
      }
    });

    function addEventListenerToButton(matchId) {
      const actionBtnCpyPre = document.getElementById(`cpy-pre-${matchId}`);

      if (actionBtnCpyPre) {
        actionBtnCpyPre.addEventListener("click", (event) => {
          let _counterValue = actionBtnCpyPre.getAttribute("data-counter");

          const cpyTextMsgPre = document.getElementById(`code-${_counterValue}`).textContent;

          navigator.clipboard.writeText(cpyTextMsgPre).then(
            function () {
              vscode.postMessage({ command: "copy", text: cpyTextMsgPre });
              console.info("Async: Copying to clipboard was successful!");
            },
            function (err) {
              console.error("Async: Could not copy text: ", err);
            }
          );
        });
      }
    }

    function escapeHtml(unsafe) {
      return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
    }

    function sendInfoChat() {
      counter++;
      let _requestInputValue = escapeHtml(requestInput.value);
      vscode.postMessage({ command: "send", text: requestInput.value });

      const loadResponseSec_1 = document.createElement("div");
      loadResponseSec_1.id = `loading-1-${counter}`;
      loadResponseSec_1.className = "animate-pulse flex space-x-4";

      const loadResponseAvatar = document.createElement("div");
      loadResponseAvatar.id = `avatar-${counter}`;
      loadResponseAvatar.className = "rounded-full bg-slate-700 h-8 w-8";

      const loadResponseSec_2 = document.createElement("div");
      loadResponseSec_2.id = `loading-2-${counter}`;
      loadResponseSec_2.className = "flex-1 space-y-2 py-1";

      const loadResponseSec_3 = document.createElement("div");
      loadResponseSec_3.id = `loading-3-${counter}`;
      loadResponseSec_3.className = "h-2 bg-slate-700 rounded";

      const loadResponseSec_4 = document.createElement("div");
      loadResponseSec_4.id = `loading-4-${counter}`;
      loadResponseSec_4.className = "h-2 bg-slate-700 rounded";

      const loadResponseSec_5 = document.createElement("div");
      loadResponseSec_5.id = `loading-5-${counter}`;
      loadResponseSec_5.className = "h-2 bg-slate-700 rounded";

      const loadResponseWrap = document.createElement("div");
      loadResponseWrap.id = `loading-${counter}`;
      loadResponseWrap.className = "o-section-response border-x border-b pt-1 pb-0.5 px-1.5 mb-1";


      const wrapConversation = document.createElement("div");
      wrapConversation.id = `wrap-ollama-conversation-${counter}`;
      wrapConversation.className = "wrap-ollama-conversation";

      const userRequestIn = document.createElement("section");
      userRequestIn.id = `req-ollama-bot-view-${counter}`;
      userRequestIn.className =
        "o-section-request border-t border-x pt-0.5 pb-1 px-1.5";

      const containerConversation = document.createElement("div");
      containerConversation.id = `container-conversation-${counter}`;
      containerConversation.className =
        "container-conversation pt-1 flex justify-between mb-1.5";

      const groupBtnDelCpy = document.createElement("div");
      groupBtnDelCpy.id = `btn-del-cpy-${counter}`;
      groupBtnDelCpy.className = "btn-del-cpy flex flex-row justify-end";

      const groupAvatar = document.createElement("div");
      groupAvatar.id = `group-avatar-${counter}`;
      groupAvatar.className = "group-avatar";
      groupAvatar.innerHTML = svgUser;

      const btnDel = document.createElement("button");
      btnDel.id = `btn-del-${counter}`;
      btnDel.className = `btn-del text-gray-500 opacity-50 hover:opacity-100 hover:text-slate-400 m-0.5`;
      btnDel.title = "delete conversation";
      btnDel.innerHTML = svgDelete;
      btnDel.setAttribute("data-counter", `${counter}`);

      const btnCpy = document.createElement("button");
      btnCpy.id = `btn-cpy-${counter}`;
      btnCpy.className = "btn-cpy text-gray-500 opacity-50 hover:opacity-100 hover:text-slate-400 m-0.5";
      btnCpy.innerHTML = svgCopy;
      btnCpy.title = "copy conversation";
      btnCpy.setAttribute("data-counter", `${counter}`);

      const btnReSend = document.createElement("button");
      btnReSend.id = `resend-${counter}`;
      btnReSend.className = "resend text-gray-500 opacity-50 hover:opacity-100 hover:text-slate-400 hover:animate-spin m-0.5";
      btnReSend.title = "re-send conversation";
      btnReSend.innerHTML = svgResend;
      btnReSend.setAttribute("data-counter", `${counter}`);

      document.getElementById("wrap-ollama-section").appendChild(wrapConversation);
      document.getElementById(`wrap-ollama-conversation-${counter}`).appendChild(userRequestIn);
      document.getElementById(`req-ollama-bot-view-${counter}`).appendChild(containerConversation);
      document.getElementById(`container-conversation-${counter}`).appendChild(groupAvatar);
      document.getElementById(`container-conversation-${counter}`).appendChild(groupBtnDelCpy);
      document.getElementById(`btn-del-cpy-${counter}`).appendChild(btnDel);
      document.getElementById(`btn-del-cpy-${counter}`).appendChild(btnReSend);
      document.getElementById(`btn-del-cpy-${counter}`).appendChild(btnCpy);
      userRequestIn.innerHTML += `<p id="req-current-bot-o-${counter}">${_requestInputValue}</p>`;
      requestInput.value = "";

      document.getElementById(`wrap-ollama-conversation-${counter}`).appendChild(loadResponseWrap);
      document.getElementById(`loading-${counter}`).appendChild(loadResponseSec_1);
      document.getElementById(`loading-1-${counter}`).appendChild(loadResponseAvatar);
      document.getElementById(`loading-1-${counter}`).appendChild(loadResponseSec_2);
      document.getElementById(`loading-2-${counter}`).appendChild(loadResponseSec_3);
      document.getElementById(`loading-2-${counter}`).appendChild(loadResponseSec_4);
      document.getElementById(`loading-2-${counter}`).appendChild(loadResponseSec_5);

      const actionBtnDel = document.getElementById(`btn-del-${counter}`);
      actionBtnDel.addEventListener("click", (event) => {
        let counterValue = btnDel.getAttribute("data-counter");
        document
          .getElementById(`wrap-ollama-conversation-${counterValue}`)
          .remove();
      });

      const actionBtnCpy = document.getElementById(`btn-cpy-${counter}`);
      actionBtnCpy.addEventListener("click", (event) => {
        let counterValue = btnCpy.getAttribute("data-counter");
        const cpyText = document.getElementById(
          `req-current-bot-o-${counterValue}`
        ).textContent;
        navigator.clipboard.writeText(cpyText).then(
          function () {
            vscode.postMessage({ command: "copy", text: cpyText });
            console.info("Async: Copying to clipboard was successful!");
          },
          function (err) {
            console.error("Async: Could not copy text: ", err);
          }
        );
      });

      const actionBtnResend = document.getElementById(`resend-${counter}`);
      actionBtnResend.addEventListener("click", (event) => {
        let counterValue = btnReSend.getAttribute("data-counter");
        let resendText = document.getElementById(`req-current-bot-o-${counterValue}`).textContent;
        document.getElementById(`res-ollama-bot-view-${counter}`).remove();
        document.getElementById(`wrap-ollama-conversation-${counter}`).appendChild(loadResponseWrap);
        vscode.postMessage({ command: "send", text: resendText });
      });

    }
  });
})();
