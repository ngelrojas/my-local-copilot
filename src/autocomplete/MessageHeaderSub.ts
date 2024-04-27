import vscode from "vscode";
import {apiMessageHeader} from "./config";

export function messageHeaderSub(document: vscode.TextDocument) {
    return apiMessageHeader
        .replace("{LANG}", document.languageId)
        .replace("{FILE_NAME}", document.fileName)
        .replace("{PROJECT_NAME}", vscode.workspace.name || "Untitled");
}
