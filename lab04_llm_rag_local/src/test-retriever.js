import { generateEmbedding } from './embedding.js';
import { retrieveDocuments } from './retriever.js';

async function main() {
  try {
    const pergunta = 'Qual tecnologia eu poderia usar para cache?';

    console.log('Pergunta:');
    console.log(pergunta);

    console.log('\nGerando embedding...');

    const embedding = await generateEmbedding(pergunta);

    console.log(`Embedding: ${embedding.length} dimensões`);

    console.log('\nExecutando MongoDB Vector Search...');

    const documents = await retrieveDocuments(embedding, 3);

    console.log('\nTop documentos:\n');

    documents.forEach((document, index) => {
      console.log(`${index + 1}. ${document.title}`);
      console.log(`   score: ${document.score.toFixed(4)}`);
      console.log(`   ${document.content}`);
      console.log();
    });
  } catch (error) {
    console.error('\nErro:');
    console.error(error);
  }
}

main();