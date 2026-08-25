const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'qwen2.5:3b';

export async function generateResponse(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao chamar Ollama: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return data.response;
}