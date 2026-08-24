require("dotenv").config();

const { MongoClient } = require("mongodb");
const { generateEmbeddings } = require("./voyage");

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

  const client = new MongoClient(
    process.env.MONGODB_URI
  );

  try {
    await client.connect();

    console.log("MongoDB conectado.");

    const db = client.db(
      process.env.MONGODB_DB
    );

    const collection = db.collection(
      process.env.MONGODB_COLLECTION
    );

    const pipeline = [
      {
        $vectorSearch: {
          index: "autoembed_index",
          path: "embedding",
          queryVector: queryEmbedding,

          numCandidates: 100,
          limit: 4,
        },
      },

      {
        $project: {
          _id: 0,
          title: 1,
          content: 1,

          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ];

    const results = await collection
      .aggregate(pipeline)
      .toArray();

    console.log(
      "\nRanking via MongoDB Vector Search:\n"
    );

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

    if (results.length > 0) {
      console.log("Melhor resultado:");
      console.log(results[0].title);
    }

  } finally {
    await client.close();

    console.log(
      "\nConexão MongoDB encerrada."
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});