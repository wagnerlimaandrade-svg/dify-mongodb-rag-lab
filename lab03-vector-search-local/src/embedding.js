const path = require("path");

const MODEL_NAME =
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

let extractorPromise = null;

async function getExtractor() {
  const { pipeline, env } = await import(
    "@huggingface/transformers"
  );

  // Guarda os arquivos baixados dentro do projeto.
  env.cacheDir = path.resolve(
    __dirname,
    "../models"
  );

  // Singleton:
  // evita carregar o modelo novamente a cada embedding.
  if (!extractorPromise) {
    console.log(
      `Carregando modelo local: ${MODEL_NAME}`
    );

    extractorPromise = pipeline(
      "feature-extraction",
      MODEL_NAME
    );
  }

  return extractorPromise;
}

async function generateEmbedding(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error(
      "O texto para geração do embedding é obrigatório."
    );
  }

  const extractor = await getExtractor();

  const output = await extractor(
    text,
    {
      pooling: "mean",
      normalize: true,
    }
  );

  const vectors = output.tolist();

  return vectors[0];
}

module.exports = {
  generateEmbedding,
  MODEL_NAME,
};
