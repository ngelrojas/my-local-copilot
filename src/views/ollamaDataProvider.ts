import * as vscode from "vscode";

export class OllamaDataProvider implements vscode.TreeDataProvider<OllamaItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<OllamaItem | undefined> =
    new vscode.EventEmitter<OllamaItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<OllamaItem | undefined> =
    this._onDidChangeTreeData.event;

  private items: OllamaItem[] = [
    new OllamaItem("Item 1"),
    new OllamaItem("Item 2"),
  ];

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: OllamaItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OllamaItem): Thenable<OllamaItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.items);
    }
  }

  displayAllItems(): void {
    this.items.forEach((item) => {
      return item.getHeader();
      // console.log(item.label);
    });
  }

  findItemByLabel(label: string): OllamaItem | undefined {
    return this.items.find((item) => item.label === label);
  }
}

class OllamaItem extends vscode.TreeItem {
  constructor(label: string) {
    super(label);
  }

  getHeader(): string {
    return "<h1>header</h1>";
  }
}
