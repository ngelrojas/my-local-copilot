### please read the license before using this software

[[license]](LICENSE.md)

#### 1.

1.1 create an panel admin DONE
1.2 send data to save DONE
1.3 retrieve data from getConfiguration and send to the loadChat DONE

#### DONE all below

1.4 create a button to refresh if a new model is installed in local machine
1.5 preserve the data model in the local machine, when is selected.
1.7 interact ui interface chat with the model chat ollama
1.7.1 refactor the loadChat into the ollamaViewProvider
1.8 styling the chat interface
1.9 refactor ollamaChat to ollamaChatProvider, because the ollamaChat return a response from the model chat

#### TODO

2.0: get a selection text and send to the model chat, the current ui interface DONE
2.1: refactor to check if the ollama is running. DONE
2.2: create ui interface with tailwindcss
2.3: check how to get the context when we chat using ollama
2.4: create a button to delete conversation, copy

### suggestions name for the plugin

below name suggestions for the chat-copilot interface
-==OLLAMA_COPILOT
-==OLLAMA_PILOT
-==OLLAMA_CODE_PILOT

### DONE

- panel admin
- input for the model chat
- retrieve answers from model in vscode
- selected text and send to the model and the answer is displayed in the vscode
  1.6 create a chat to test a model like a chat-copilot interface.

### tip

- to create a tailwindcss minify file, use the command below
- first install the tailwindcss, in your project or if you have it, just go the directory
- and run the command below

```bash
npx tailwindcss -i ./[styles.css or index.css] -o ./dist/tailwind.css --minify
```
