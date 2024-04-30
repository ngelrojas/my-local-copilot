import ollama from "ollama";

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
            num_predict: 1000,
            temperature: 0.5,
            stop: ["```"]
        }
    });
};
