(function(){

    const vscode = acquireVsCodeApi();

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

    });

});