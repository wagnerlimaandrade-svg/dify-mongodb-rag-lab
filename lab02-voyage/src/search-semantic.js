require("dotenv").config();

const { MongoClient } = require("mongodb");
const { generateEmbeddings } = require("./voyage");

function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Os vetores possuem dimensões diferentes");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];

    magnitudeA += vectorA[i] ** 2;
    magnitudeB += vectorB[i] ** 2;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
}

async function main() {
  const question =
    "Qual tecnologia eu poderia usar para cache?";

  console.log("Pergunta:");
  console.log(question);

  console.log("\nGerando embedding da pergunta...");

  const [queryEmbedding] = await generateEmbeddings(
    [question],
    "query"
  );

  console.log(
    `Embedding da pergunta: ${queryEmbedding.length} dimensões`
  );

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    console.log("MongoDB conectado.");

    const db = client.db(process.env.MONGODB_DB);

    const collection = db.collection(
      process.env.MONGODB_COLLECTION
    );

    const documents = await collection
      .find({})
      .toArray();

    const results = documents.map((document) => {
      const score = cosineSimilarity(
        queryEmbedding,
        document.embedding
      );

      return {
        title: document.title,
        content: document.content,
        score,
      };
    });

    results.sort((a, b) => b.score - a.score);

    console.log("\nRanking semântico:\n");

    results.forEach((result, index) => {
      console.log(
        `${index + 1}. ${result.title}`
      );

      console.log(
        `   score: ${result.score.toFixed(4)}`
      );

      console.log(
        `   ${result.content}\n`
      );
    });

    console.log("Melhor resultado:");
    console.log(results[0].title);

  } finally {
    await client.close();

    console.log("\nConexão MongoDB encerrada.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});