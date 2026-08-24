# Lab 2 — Embeddings com Voyage AI

Checkpoint histórico que introduz embeddings e similaridade semântica por meio da API externa Voyage AI. Ele é mantido para preservar a progressão do aprendizado; o núcleo recomendado atualmente usa embeddings locais nos Labs 3 e 4.

## Configuração

```bash
cp .env.example .env
npm ci
```

Preencha uma chave válida apenas no `.env`. Este lab envia os textos para `https://api.voyageai.com/v1/embeddings` usando o modelo `voyage-4-large`.

## Execução

O `package.json` deste lab não define scripts npm; execute os arquivos diretamente:

```bash
node src/test-voyage
node src/seed-embeddings.js
node src/search-semantic.js
node src/search-vector.js
```

- `test-voyage` valida uma chamada simples à API;
- `seed-embeddings.js` gera vetores para MongoDB, PostgreSQL, Redis e Kafka e faz upsert por `sourceId`;
- `search-semantic.js` calcula similaridade cosseno em memória;
- `search-vector.js` delega a busca ao MongoDB pelo índice hardcoded `autoembed_index`.

A pergunta de referência é `Qual tecnologia eu poderia usar para cache?`, e Redis deve ser o melhor resultado semântico.

## Compatibilidade

Os vetores deste lab pertencem a outro modelo e não devem compartilhar o mesmo campo/índice usado pelos embeddings MiniLM de 384 dimensões. Para executar `search-vector.js`, o índice `autoembed_index` precisa ser configurado separadamente com a dimensão produzida por `voyage-4-large`.
