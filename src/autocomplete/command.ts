import vscode from "vscode";
import {apiEndpoint, apiModel, apiTemperature, promptWindowSize} from "./config";
import { OLLAMA_COMMAND } from "../constants/ollamaConstant";

let {numPredict} = require('./config');
numPredict = parseInt(numPredict);

import axios from "axios";
import {messageHeaderSub} from "./MessageHeaderSub";

export async function autocompleteCommand(textEditor: vscode.TextEditor, cancellationToken?: vscode.CancellationToken) {
    const document = textEditor.document;
    const position = textEditor.selection.active;

    // Get the current prompt from editor
    let prompt = document.getText(new vscode.Range(document.lineAt(0).range.start, position));
    prompt = prompt.substring(Math.max(0, prompt.length - promptWindowSize), prompt.length);

    // Show a progress message
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: OLLAMA_COMMAND.TITLE,
            cancellable: true,
        },
        async (progress, progressCancellationToken) => {
            try {
                progress.report({ message: OLLAMA_COMMAND.PROGRESS });

                let axiosCancelPost: () => void;
                const axiosCancelToken = new axios.CancelToken((c) => {
                    const cancelPost = function () {
                        c(OLLAMA_COMMAND.CANCEL);
                    };
                    axiosCancelPost = cancelPost;
                    if (cancellationToken){
                        cancellationToken.onCancellationRequested(cancelPost);
                    }
                    progressCancellationToken.onCancellationRequested(cancelPost);
                    vscode.workspace.onDidCloseTextDocument(cancelPost);
                });

                const response = await axios.post(apiEndpoint, {
                        model: apiModel, // Change this to the model you want to use
                        prompt: messageHeaderSub(textEditor.document) + prompt,
                        stream: true,
                        raw: true,
                        options: {
                            num_predict: numPredict,
                            temperature: apiTemperature,
                            stop: ["```"]
                        }
                    }, {
                        cancelToken: axiosCancelToken,
                        responseType: 'stream'
                    }
                );

                //tracker
                let currentPosition = position;

                response.data.on('data', async (d: Uint8Array) => {
                    progress.report({ message: OLLAMA_COMMAND.GENERATING });

                    // Check for user input (cancel)
                    if (currentPosition.line !== textEditor.selection.end.line || currentPosition.character !== textEditor.selection.end.character) {
                        axiosCancelPost(); // cancel axios => cancel finished promise => close notification
                        return;
                    }

                    // Get a completion from the response
                    const completion: string = JSON.parse(d.toString()).response;
                    // lastToken = completion;

                    if (completion === "") {
                        return;
                    }

                    //complete edit for token
                    const edit = new vscode.WorkspaceEdit();
                    edit.insert(document.uri, currentPosition, completion);
                    await vscode.workspace.applyEdit(edit);

                    // Move the cursor to the end of the completion
                    const completionLines = completion.split("\n");
                    const newPosition = new vscode.Position(
                        currentPosition.line + completionLines.length - 1,
                        (completionLines.length > 1 ? 0 : currentPosition.character) + completionLines[completionLines.length - 1].length
                    );
                    const newSelection = new vscode.Selection(
                        position,
                        newPosition
                    );
                    currentPosition = newPosition;

                    // completion bar
                    progress.report({ message: OLLAMA_COMMAND.GENERATING, increment: 1 / (numPredict / 100) });

                    // move cursor
                    textEditor.selection = newSelection;
                });

                // Keep cancel window available
                const finished = new Promise((resolve) => {
                    response.data.on('end', () => {
                        progress.report({ message: OLLAMA_COMMAND.FINISHED });
                        resolve(true);
                    });
                    axiosCancelToken.promise.finally(() => { // prevent notification from freezing on user input cancel
                        resolve(false);
                    });
                });

                await finished;

            } catch (err: any) {
                vscode.window.showErrorMessage(
                    `${OLLAMA_COMMAND.ERROR}: ${err.message}`
                );
            }
        }
    );
}