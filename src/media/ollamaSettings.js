(function () {
    vscode = acquireVsCodeApi();

    document.addEventListener("DOMContentLoaded", (event) => {
        document.getElementById('settingsForm').addEventListener('submit', (event) => {
            event.preventDefault();

            let selectedModels = '';
            const radios = document.querySelectorAll('input[name="model"]');

            radios.forEach((radio) => {
                if(radio.checked){
                    selectedModels = radio.parentElement.textContent.trim();
                }
            });

            vscode.postMessage({
                command: 'save',
                value: selectedModels,
            });
        });
        //tabs
        document.querySelectorAll('.tab').forEach(i => {

            i.addEventListener('click', (e) => {
                console.log("HERE TABS ",i.dataset.tabId);
                document.querySelectorAll('.tab').forEach(e => {
                    e.classList.remove("active");
                });

                i.classList.add('active');

                document.querySelectorAll('.tabContent').forEach(e => {
                    e.classList.add("hidden");
                });
                const target = i.dataset.tabId

                document.getElementById(target).classList.remove("hidden");
            });
        });

    });

})();
