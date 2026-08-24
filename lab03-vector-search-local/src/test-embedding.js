const {
  generateEmbedding,
  MODEL_NAME,
} = require("./embedding");

async function main() {
  const text =
    "Qual tecnologia eu poderia usar para cache?";

  console.log("Modelo:");
  console.log(MODEL_NAME);

  console.log("\nTexto:");
  console.log(text);

  console.log("\nGerando embedding...");

  const embedding =
    await generateEmbedding(text);

  console.log("\nEmbedding gerado com sucesso.");

  console.log(
    `Dimensões: ${embedding.length}`
  );

  console.log(
    "Primeiros 10 valores:"
  );

  console.log(
    embedding.slice(0, 10)
  );

  const allNumbers = embedding.every(
    (value) =>
      typeof value === "number" &&
      Number.isFinite(value)
  );

  console.log(
    `Todos os valores são numéricos: ${allNumbers}`
  );

  if (embedding.length !== 384) {
    throw new Error(
      `Dimensão inesperada. Esperado: 384. Recebido: ${embedding.length}`
    );
  }

  console.log(
    "\nValidação concluída: embedding possui 384 dimensões."
  );
}

main().catch((error) => {
  console.error(
    "\nErro ao gerar embedding:"
  );

  console.error(error);

  process.exit(1);
});