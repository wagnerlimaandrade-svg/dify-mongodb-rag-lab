import { generateEmbedding } from './embedding.js';
import { retrieveDocuments } from './retriever.js';
import { buildContext } from './context-builder.js';
import { buildRagPrompt } from './prompt-builder.js';
import { generateResponse } from './llm.js';

export async function askRag(
  question,
  topK = 3,
  minScore = 0.65
) {
  if (!question || typeof question !== 'string') {
    throw new Error('A pergunta deve ser uma string válida.');
  }

  console.log('\n1. Gerando embedding da pergunta...');

  const embedding = await generateEmbedding(question);

  console.log(`   Embedding gerado: ${embedding.length} dimensões`);

  console.log('\n2. Executando busca vetorial...');

  const documents = await retrieveDocuments(
    embedding,
    topK,
    minScore
  );

  console.log(`   Documentos relevantes: ${documents.length}`);

  if (documents.length === 0) {
    return {
      question,
      documents: [],
      context: '',
      answer:
        'Não há informação suficiente no contexto para responder.',
    };
  }

  console.log('\n3. Construindo contexto...');

  const context = buildContext(documents);

  console.log('   Contexto construído.');

  console.log('\n4. Construindo prompt RAG...');

  const prompt = buildRagPrompt(question, context);

  console.log('   Prompt construído.');

  console.log('\n5. Consultando LLM local...');

  const answer = await generateResponse(prompt);

  return {
    question,
    documents,
    context,
    answer,
  };
}