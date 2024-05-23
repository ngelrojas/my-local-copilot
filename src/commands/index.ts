import Questions from '../core/Questions';

const questions = new Questions();

export async function createQuestion(qText: string, codeSelected: string, model: string, qImg: string) {
  return await questions.create(qText, codeSelected, model, qImg);
}

export async function readQuestion(id: number) {
  return await questions.read(id);
}

export async function updateQuestion(id: number, qText: string, codeSelected: string, model: string, qImg: string) {
  return await questions.update(id, qText, codeSelected, model, qImg);
}

export async function deleteQuestion(id: number) {
  return await questions.delete(id);
}