import ollama from "ollama";
import {apiTemperature, numPredict} from "../autocomplete/config";

interface promptRequest {
    prompt: string;
    inputModel: string;
}

export const OllamaGenerate = async ({inputModel, prompt}: promptRequest) => {
    return await ollama.generate({
        model: `${inputModel}`,
        prompt: `${prompt}`,
        stream: true,
        raw: true,
        options: {
            num_predict: numPredict,
            temperature: apiTemperature,
            stop: ["```"]
        }
    });
};
