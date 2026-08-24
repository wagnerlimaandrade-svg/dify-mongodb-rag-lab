require("dotenv").config();

const { MongoClient } = require("mongodb");

const VECTOR_DIMENSIONS = 384;

async function main() {
  const {
    MONGODB_URI,
    MONGODB_DB,
    MONGODB_COLLECTION,
    MONGODB_VECTOR_INDEX,
  } = process.env;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI não configurada");
  }

  if (!MONGODB_DB) {
    throw new Error("MONGODB_DB não configurado");
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

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    console.log("MongoDB conectado.");

    const db = client.db(MONGODB_DB);

    /*
     * O seed ainda não foi executado.
     * Portanto a collection pode não existir.
     */
    const existingCollections =
      await db
        .listCollections({
          name: MONGODB_COLLECTION,
        })
        .toArray();

    if (existingCollections.length === 0) {
      await db.createCollection(
        MONGODB_COLLECTION
      );

      console.log(
        `Collection criada: ${MONGODB_COLLECTION}`
      );
    }

    const collection =
      db.collection(MONGODB_COLLECTION);

    /*
     * Evita tentar criar novamente
     * o mesmo índice.
     */
    const existingIndexes =
      await collection
        .listSearchIndexes(
          MONGODB_VECTOR_INDEX
        )
        .toArray();

    if (existingIndexes.length > 0) {
      console.log(
        `Índice já existe: ${MONGODB_VECTOR_INDEX}`
      );

      console.log(
        "Status:",
        existingIndexes[0].status
      );

      console.log(
        "Queryable:",
        existingIndexes[0].queryable
      );

      return;
    }

    const indexDefinition = {
      name: MONGODB_VECTOR_INDEX,

      type: "vectorSearch",

      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions:
              VECTOR_DIMENSIONS,
            similarity: "cosine",
          },
        ],
      },
    };

    console.log(
      `Criando índice: ${MONGODB_VECTOR_INDEX}`
    );

    await collection.createSearchIndex(
      indexDefinition
    );

    console.log(
      "Solicitação de criação enviada."
    );

    /*
     * A criação é assíncrona.
     * Vamos aguardar o índice ficar READY.
     */
    for (let attempt = 1; attempt <= 30; attempt++) {
      const indexes =
        await collection
          .listSearchIndexes(
            MONGODB_VECTOR_INDEX
          )
          .toArray();

      const index = indexes[0];

      if (index) {
        console.log(
          `Tentativa ${attempt}: ` +
          `status=${index.status}, ` +
          `queryable=${index.queryable}`
        );

        if (
          index.status === "READY" &&
          index.queryable === true
        ) {
          console.log(
            "\nÍndice vetorial pronto."
          );

          return;
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );
    }

    throw new Error(
      "O índice não ficou READY dentro do tempo esperado."
    );

  } finally {
    await client.close();

    console.log(
      "\nConexão MongoDB encerrada."
    );
  }
}

main().catch((error) => {
  console.error(
    "\nErro ao criar índice vetorial:"
  );

  console.error(error);

  process.exit(1);
});