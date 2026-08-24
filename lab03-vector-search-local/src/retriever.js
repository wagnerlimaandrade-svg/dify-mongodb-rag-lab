require("dotenv").config();

const { MongoClient } = require("mongodb");

const {
  generateEmbedding,
} = require("./embedding");

const VECTOR_DIMENSIONS = 384;

/**
 * Recupera documentos semanticamente próximos
 * da pergunta informada.
 *
 * @param {string} question
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function retrieve(question, limit = 4) {
  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    throw new Error(
      "A pergunta deve ser um texto válido."
    );
  }

  const {
    MONGODB_URI,
    MONGODB_DB,
    MONGODB_COLLECTION,
    MONGODB_VECTOR_INDEX,
  } = process.env;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI não configurada"
    );
  }

  if (!MONGODB_DB) {
    throw new Error(
      "MONGODB_DB não configurado"
    );
  }

  if (!MONGODB_COLLECTION) {
    throw new Error(
      "MONGODB_COLLECTION não configurada"
    );
  }

  if (!MONGODB_VECTOR_INDEX) {
    throw new Error(
      "MONGODB_VECTOR_INDEX não configurado"
    );
  }

  /*
   * 1. Gera embedding local da pergunta
   */
  const queryEmbedding =
    await generateEmbedding(question);

  if (
    queryEmbedding.length !==
    VECTOR_DIMENSIONS
  ) {
    throw new Error(
      `Embedding da pergunta possui ` +
      `${queryEmbedding.length} dimensões. ` +
      `Esperado: ${VECTOR_DIMENSIONS}.`
    );
  }

  /*
   * 2. Conecta ao MongoDB Atlas Local
   */
  const client = new MongoClient(
    MONGODB_URI
  );

  try {
    await client.connect();

    const db = client.db(
      MONGODB_DB
    );

    const collection = db.collection(
      MONGODB_COLLECTION
    );

    /*
     * 3. Vector Search executado
     *    dentro do MongoDB.
     */
    const results =
      await collection.aggregate([
        {
          $vectorSearch: {
            index: MONGODB_VECTOR_INDEX,
            path: "embedding",

            queryVector:
              queryEmbedding,

            numCandidates: 100,

            limit,
          },
        },

        /*
         * 4. Não devolvemos o embedding inteiro.
         */
        {
          $project: {
            _id: 0,

            sourceId: 1,
            title: 1,
            content: 1,

            score: {
              $meta:
                "vectorSearchScore",
            },
          },
        },
      ]).toArray();

    return results;

  } finally {
    await client.close();
  }
}

module.exports = {
  retrieve,
};