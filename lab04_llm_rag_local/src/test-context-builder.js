import { generateEmbedding } from './embedding.js';
import { retrieveDocuments } from './retriever.js';
import { buildContext } from './context-builder.js';

async function main() {
  try {
    const pergunta = 'Qual tecnologia eu poderia usar para cache?';

    console.log('Pergunta:');
    console.log(pergunta);

    console.log('\nGerando embedding...');

    const embedding = await generateEmbedding(pergunta);

    console.log('\nRecuperando documentos...');

    const documents = await retrieveDocuments(embedding, 3);

    console.log(`Documentos recuperados: ${documents.length}`);

    console.log('\nConstruindo contexto...');

    const context = buildContext(documents);

    console.log('\n========== CONTEXTO ==========\n');

    console.log(context);

    console.log('\n==============================');
  } catch (error) {
    console.error('\nErro:');
    console.error(error);
  }
}

main();