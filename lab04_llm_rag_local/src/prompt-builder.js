export function buildRagPrompt(question, context) {
  if (!question || typeof question !== 'string') {
    throw new Error('question deve ser uma string válida.');
  }

  if (typeof context !== 'string') {
    throw new Error('context deve ser uma string.');
  }

  return `
Você é um assistente que responde perguntas com base exclusivamente no contexto fornecido.

Regras:
1. Use apenas as informações presentes no contexto.
2. Não invente informações.
3. Se o contexto não contiver informação suficiente para responder, diga:
   "Não há informação suficiente no contexto para responder."
4. Responda de forma objetiva e em português.

CONTEXTO:
${context}

PERGUNTA:
${question}

RESPOSTA:
`.trim();
}
