import { generateResponse } from './llm.js';

async function main() {
  try {
    const prompt = 'Explique em uma frase o que é PostgreSQL.';

    console.log('Pergunta:');
    console.log(prompt);

    console.log('\nConsultando LLM local...');

    const resposta = await generateResponse(prompt);

    console.log('\nResposta:');
    console.log(resposta);
  } catch (error) {
    console.error('\nErro:');
    console.error(error.message);
  }
}

main();
