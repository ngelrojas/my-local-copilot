import vscode from "vscode";
import {
    apiEndpoint,
    apiModel, apiTemperature, continueInline,
    promptWindowSize,
    responsePreview,
    responsePreviewDelay,
    responsePreviewMaxTokens
} from "./config";
import axios from "axios";
import {messageHeaderSub} from "./MessageHeaderSub";

export async function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, cancellationToken: vscode.CancellationToken) {

    // Create a completion item
    const item = new vscode.CompletionItem("Autocomplete with Ollama");

    // Set the insert text to a placeholder
    item.insertText = new vscode.SnippetString('${1:}');

    // Wait before initializing Ollama to reduce compute usage
    if (responsePreview) await new Promise(resolve => setTimeout(resolve, responsePreviewDelay * 1000));
    if (cancellationToken.isCancellationRequested) {
        return [ item ];
    }

    // Set the label & inset text to a shortened, non-stream response
    if (responsePreview) {
        let prompt = document.getText(new vscode.Range(document.lineAt(0).range.start, position));
        prompt = prompt.substring(Math.max(0, prompt.length - promptWindowSize), prompt.length);
        const response_preview = await axios.post(apiEndpoint, {
            model: apiModel, // Change this to the model you want to use
            prompt: messageHeaderSub(document) + prompt,
            stream: false,
            raw: true,
            options: {
                num_predict: responsePreviewMaxTokens, // reduced compute max
                temperature: apiTemperature,
                stop: ['\n', '```']
            }
        }, {
            cancelToken: new axios.CancelToken((c) => {
                const cancelPost = function () {
                    c("Autocompletion request terminated by completion cancel");
                };
                cancellationToken.onCancellationRequested(cancelPost);
            })
        });

        if (response_preview.data.response.trim() != "") { // default if empty
            item.label = response_preview.data.response.trimStart(); // tended to add whitespace at the beginning
            item.insertText = response_preview.data.response.trimStart();
        }
    }

    // Set the documentation to a message
    item.documentation = new vscode.MarkdownString('Press `Enter` to get an autocompletion from Ollama');
    // Set the command to trigger the completion
    if (continueInline || !responsePreview){
        item.command = {
            command: 'mylocal-autocoder.autocomplete',
            title: 'Autocomplete with Ollama',
            arguments: [cancellationToken]
        };
    }
    // Return the completion item
    return [item];
}