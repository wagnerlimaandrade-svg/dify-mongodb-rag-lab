require("dotenv").config();

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

async function main() {
  try {
    await client.connect();

    const collection = client
      .db("corporate_ai")
      .collection("knowledge_chunks");

    const documentos = await collection
      .find({
  "metadata.department": "Segurança"
    })
      .toArray();

    console.log("Documentos encontrados:");
    console.log(JSON.stringify(documentos, null, 2));

  } catch (error) {
    console.error("Erro ao consultar MongoDB:");
    console.error(error);

  } finally {
    await client.close();
  }
}

main();
