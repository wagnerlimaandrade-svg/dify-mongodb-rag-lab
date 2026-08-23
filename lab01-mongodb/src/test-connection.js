require("dotenv").config();

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

async function main() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB conectado com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:");
    console.error(error);
  } finally {
    await client.close();
  }
}

main()
