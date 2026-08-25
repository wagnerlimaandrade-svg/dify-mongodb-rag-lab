import { pipeline } from '@xenova/transformers';

const MODEL = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    console.log(`Carregando modelo de embedding: ${MODEL}`);

    extractor = await pipeline(
      'feature-extraction',
      MODEL
    );
  }

  return extractor;
}

export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('O texto para embedding deve ser uma string válida.');
  }

  const model = await getExtractor();

  const output = await model(text, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
}
