import { generateEmbedding } from './embedding.js';

async function main() {
  try {
    const pergunta = 'Qual tecnologia eu poderia usar para cache?';

    console.log('Pergunta:');
    console.log(pergunta);

    console.log('\nGerando embedding local...');

    const embedding = await generateEmbedding(pergunta);

    console.log('\nEmbedding gerado.');
    console.log(`Dimensão: ${embedding.length}`);

    console.log('\nPrimeiros 5 valores:');
    console.log(embedding.slice(0, 5));
  } catch (error) {
    console.error('\nErro:');
    console.error(error.message);
  }
}

main();
