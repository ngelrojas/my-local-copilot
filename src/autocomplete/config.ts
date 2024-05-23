import * as vscode from "vscode";

export let VSConfig: vscode.WorkspaceConfiguration;
export let apiEndpoint: string;
export let apiModel: string;
export let apiTemperature: number;
export let apiMessageHeader: string;
export let numPredict: number;
export let promptWindowSize: number;
export let completionKeys: string;
export let responsePreview: boolean | undefined;
export let responsePreviewMaxTokens: number;
export let responsePreviewDelay: number;
export let continueInline: boolean | undefined;

export function updateVSConfig() {
    VSConfig = vscode.workspace.getConfiguration("mylocal-autocoder");
    const config = vscode.workspace.getConfiguration("my-local-copilot");
    apiEndpoint = VSConfig.get("endpoint") || "http://localhost:11434/api/generate";
    apiModel = config.get("model") as string;
    apiMessageHeader = VSConfig.get("message header") || "";
    numPredict = VSConfig.get("max tokens predicted") || 1000;
    promptWindowSize = VSConfig.get("prompt window size") || 2000;
    completionKeys = VSConfig.get("completion keys") || " ";
    responsePreview = VSConfig.get("response preview");
    responsePreviewMaxTokens = VSConfig.get("preview max tokens") || 50;
    responsePreviewDelay = VSConfig.get("preview delay") || 0; // Must be || 0 instead of || [default] because of truthy
    continueInline = VSConfig.get("continue inline");
    apiTemperature = VSConfig.get("temperature") || 0.5;
}