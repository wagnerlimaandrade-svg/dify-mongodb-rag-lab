import 'dotenv/config';
import { MongoClient } from 'mongodb';

const {
  MONGODB_URI,
  MONGODB_DB,
  MONGODB_COLLECTION,
  MONGODB_VECTOR_INDEX,
} = process.env;

function validateConfig() {
  const required = {
    MONGODB_URI,
    MONGODB_DB,
    MONGODB_COLLECTION,
    MONGODB_VECTOR_INDEX,
  };

  for (const [name, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`Variável de ambiente ausente: ${name}`);
    }
  }
}

export async function retrieveDocuments(
  queryVector,
  topK = 3,
  minScore = 0.65
) {
  validateConfig();

  if (!Array.isArray(queryVector)) {
    throw new Error('queryVector deve ser um array.');
  }

  if (queryVector.length !== 384) {
    throw new Error(
      `Embedding inválido. Esperado: 384 dimensões. Recebido: ${queryVector.length}.`
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const db = client.db(MONGODB_DB);
    const collection = db.collection(MONGODB_COLLECTION);

    const searchLimit = Math.max(topK * 5, 20);

    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: MONGODB_VECTOR_INDEX,
            path: 'embedding',
            queryVector,
            numCandidates: Math.max(searchLimit * 10, 100),
            limit: searchLimit,
          },
        },

        {
          $project: {
            _id: 0,
            title: 1,
            content: 1,
            score: {
              $meta: 'vectorSearchScore',
            },
          },
        },

        {
          $match: {
            score: {
              $gte: minScore,
            },
          },
        },

        {
          $limit: topK,
        },
      ])
      .toArray();

    return results;
  } finally {
    await client.close();
  }
}