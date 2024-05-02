### please read the license before using this software

[[license]](LICENSE.md)

#### TODO

3.0: get all configuration from ollama and put in settings-chat - create a panel
including to lava-model.
-- create parameters to chat.
-- create parameters to the autocomplete.

2.5: create a button refresh model in settings.

2.8: ISSUE: when selected other option, like a display-plugins, the chat lost all conversation.

2.9: include lava-model to processing images.

3.1: create a settings to pull models from ollama, using a button or something similar, ollama should be installed an running.

3.3: detect the programming language and put in a box, to select the model chat.

3.4: create a database to save the conversation, when the user close the vscode, the conversation is saved.

### DONE

1.1 create an panel admin DONE
1.2 send data to save DONE
1.3 retrieve data from getConfiguration and send to the loadChat DONE
1.4 create a button to refresh if a new model is installed in local machine
1.5 preserve the data model in the local machine, when is selected.
1.7 interact ui interface chat with the model chat ollama
1.7.1 refactor the loadChat into the ollamaViewProvider
1.8 styling the chat interface
1.9 refactor ollamaChat to ollamaChatProvider, because the ollamaChat return a response from the model chat

2.0: get a selection text and send to the model chat, the current ui interface DONE
2.1: refactor to check if the ollama is running. DONE
2.2: create ui interface with tailwindcss DONE
2.4: create a button to delete conversation, copy DONE
2.6: create a method to send msg-copy to editor DONE
2.7: create other div into the section-chat to separate request to request-display DONE
3.2: create autocomplete chatbot. DONE
3.5: change ollama.chat to ollama.generate, because the .generate is more complete
to response. DONE
3.6: create a button to delete all conversation and send info using press enter. DONE
2.3: check don't lose context, when we chat using ollama, in each model - create a prompting setting. DONE

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

### suggestions name for the plugin

below name suggestions for the chat-copilot interface
-==OLLAMA_COPILOT
-==OLLAMA_PILOT
-==OLLAMA_CODE_PILOT
