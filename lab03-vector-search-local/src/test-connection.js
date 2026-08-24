require("dotenv").config();

const { MongoClient } = require("mongodb");

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "A variável MONGODB_URI não foi definida."
    );
  }

  console.log("Conectando ao MongoDB local...");
  console.log(`URI: ${uri}`);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const admin = client.db("admin");

    const result = await admin.command({
      ping: 1,
    });

    console.log("\nMongoDB conectado com sucesso.");
    console.log("Ping:", result);

    const db = client.db(
      process.env.MONGODB_DB
    );

    console.log(
      `Banco configurado: ${db.databaseName}`
    );

    console.log(
      `Collection configurada: ${process.env.MONGODB_COLLECTION}`
    );

  } finally {
    await client.close();

    console.log(
      "\nConexão MongoDB encerrada."
    );
  }
}

main().catch((error) => {
  console.error("\nErro ao conectar ao MongoDB:");
  console.error(error);

  process.exit(1);
});