import { generateEmbedding } from './embedding.js';
import { retrieveDocuments } from './retriever.js';
import { buildContext } from './context-builder.js';
import { buildRagPrompt } from './prompt-builder.js';

async function main() {
  try {
    const question = 'Qual tecnologia eu poderia usar para cache?';

    console.log('Pergunta:');
    console.log(question);

    console.log('\nGerando embedding...');
    const embedding = await generateEmbedding(question);

    console.log('\nRecuperando documentos...');
    const documents = await retrieveDocuments(embedding, 3);

    console.log('\nConstruindo contexto...');
    const context = buildContext(documents);

    console.log('\nConstruindo prompt RAG...');
    const prompt = buildRagPrompt(question, context);

    console.log('\n========== PROMPT RAG ==========\n');

    console.log(prompt);

    console.log('\n================================');
  } catch (error) {
    console.error('\nErro:');
    console.error(error);
  }
}

main();
