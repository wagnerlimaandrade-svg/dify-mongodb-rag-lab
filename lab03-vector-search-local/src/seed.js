require("dotenv").config();

const { MongoClient } = require("mongodb");

const {
  generateEmbedding,
  MODEL_NAME,
} = require("./embedding");

const documents = [
  {
    sourceId: "mongodb",
    title: "MongoDB",
    content:
      "MongoDB é um banco de dados NoSQL orientado a documentos que armazena dados em estruturas semelhantes a JSON.",
  },

  {
    sourceId: "postgresql",
    title: "PostgreSQL",
    content:
      "PostgreSQL é um banco de dados relacional open source que utiliza SQL e oferece suporte a transações ACID.",
  },

  {
    sourceId: "redis",
    title: "Redis",
    content:
      "Redis é um banco de dados em memória baseado em estruturas de chave e valor, muito utilizado para cache.",
  },

  {
    sourceId: "kafka",
    title: "Apache Kafka",
    content:
      "Apache Kafka é uma plataforma distribuída de streaming de eventos utilizada para processamento de dados em tempo real.",
  },
];

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB;
  const collectionName = process.env.MONGODB_COLLECTION;

  if (!mongoUri) {
    throw new Error("MONGODB_URI não configurada");
  }

  if (!databaseName) {
    throw new Error("MONGODB_DB não configurado");
  }

  if (!collectionName) {
    throw new Error("MONGODB_COLLECTION não configurada");
  }

  console.log("Modelo:");
  console.log(MODEL_NAME);

  console.log("\nGerando embeddings locais...");

  const embeddings = [];

  for (const document of documents) {
    console.log(
      `Gerando embedding: ${document.title}`
    );

    const embedding =
      await generateEmbedding(document.content);

    if (embedding.length !== 384) {
      throw new Error(
        `Embedding inválido para ${document.title}. ` +
        `Esperado: 384. Recebido: ${embedding.length}`
      );
    }

    embeddings.push(embedding);
  }

  console.log(
    `\n${embeddings.length} embeddings gerados.`
  );

  console.log(
    `Dimensão: ${embeddings[0].length}`
  );

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();

    console.log("\nMongoDB conectado.");

    const db = client.db(databaseName);

    const collection =
      db.collection(collectionName);

    const operations = documents.map(
      (document, index) => ({
        updateOne: {
          filter: {
            sourceId: document.sourceId,
          },

          update: {
            $set: {
              title: document.title,
              content: document.content,
              embedding: embeddings[index],

              embeddingModel: MODEL_NAME,

              embeddingDimensions:
                embeddings[index].length,

              updatedAt: new Date(),
            },

            $setOnInsert: {
              sourceId: document.sourceId,
              createdAt: new Date(),
            },
          },

          upsert: true,
        },
      })
    );

    const result =
      await collection.bulkWrite(operations);

    console.log("\nSeed concluído.");
    console.log(
      "Inseridos:",
      result.upsertedCount
    );
    console.log(
      "Atualizados:",
      result.modifiedCount
    );

  } finally {
    await client.close();

    console.log(
      "\nConexão MongoDB encerrada."
    );
  }
}

main().catch((error) => {
  console.error("\nErro durante o seed:");
  console.error(error);

  process.exit(1);
});