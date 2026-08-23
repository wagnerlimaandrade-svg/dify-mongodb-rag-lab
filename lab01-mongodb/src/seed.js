require("dotenv").config();

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

const documentos = [
  {
    document_id: "runbook-api-x",
    chunk_id: "runbook-api-x-001",
    title: "Troubleshooting API X",
    category: "operacao",
    source: "runbook-api-x.pdf",
    text: `
      Quando ocorrer timeout na API X, primeiro valide
      a conectividade com o serviço de destino.

      Em seguida, verifique os logs do gateway e confirme
      se o timeout configurado é de 30 segundos.

      Caso o serviço permaneça indisponível, acione a
      equipe responsável pela integração.
    `,
    metadata: {
      department: "TI",
      classification: "interno",
      version: "1.0",
      language: "pt-BR"
    },
    created_at: new Date()
  },

  {
    document_id: "politica-acesso",
    chunk_id: "politica-acesso-001",
    title: "Política de Acesso Administrativo",
    category: "seguranca",
    source: "politica-acesso.pdf",
    text: `
      Todo acesso administrativo deve utilizar
      autenticação multifator.

      Contas administrativas não devem ser compartilhadas
      entre colaboradores.
    `,
    metadata: {
      department: "Segurança",
      classification: "restrito",
      version: "2.1",
      language: "pt-BR"
    },
    created_at: new Date()
  },

  {
    document_id: "padrao-integracao",
    chunk_id: "padrao-integracao-001",
    title: "Padrão de Integração de APIs",
    category: "arquitetura",
    source: "padrao-integracao.pdf",
    text: `
      APIs corporativas devem utilizar HTTPS.

      Integrações síncronas devem definir políticas
      explícitas de timeout e retry.

      Serviços críticos devem possuir mecanismos de
      observabilidade e rastreamento de falhas.
    `,
    metadata: {
      department: "Arquitetura",
      classification: "interno",
      version: "3.0",
      language: "pt-BR"
    },
    created_at: new Date()
  }
];

async function main() {
  try {
    await client.connect();

    const db = client.db("corporate_ai");
    const collection = db.collection("knowledge_chunks");

    await collection.deleteMany({});

    const result = await collection.insertMany(documentos);

    console.log(`${result.insertedCount} documentos inseridos com sucesso.`);
  } catch (error) {
    console.error("Erro ao inserir documentos:");
    console.error(error);
  } finally {
    await client.close();
  }
}

main();
