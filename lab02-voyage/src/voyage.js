const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

async function generateEmbeddings(texts, inputType = "document") {
  const apiKey = process.env.VOYAGE_API_KEY;

  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY não configurada");
  }

  const response = await fetch(VOYAGE_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },

    body: JSON.stringify({
      input: texts,
      model: "voyage-4-large",
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Erro Voyage API (${response.status}): ${error}`
    );
  }

  const result = await response.json();

  return result.data.map((item) => item.embedding);
}

module.exports = {
  generateEmbeddings,
};