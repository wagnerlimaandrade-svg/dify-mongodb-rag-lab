const {
  retrieve,
} = require("./retriever");

async function main() {
  const question =
    "Qual tecnologia eu poderia usar para cache?";

  console.log("Pergunta:");
  console.log(question);

  console.log(
    "\nExecutando busca vetorial local..."
  );

  const results = await retrieve(
    question,
    4
  );

  if (results.length === 0) {
    throw new Error(
      "Nenhum resultado encontrado."
    );
  }

  console.log(
    "\nRanking via MongoDB Vector Search:\n"
  );

  results.forEach(
    (result, index) => {
      console.log(
        `${index + 1}. ${result.title}`
      );

      console.log(
        `   score: ${result.score.toFixed(4)}`
      );

      console.log(
        `   ${result.content}\n`
      );
    }
  );

  console.log("Melhor resultado:");
  console.log(results[0].title);
}

main().catch((error) => {
  console.error(
    "\nErro durante a busca vetorial:"
  );

  console.error(error);

  process.exit(1);
});