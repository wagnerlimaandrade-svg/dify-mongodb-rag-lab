# Lab 3 — Embeddings e Vector Search locais

Este lab substitui embeddings externos pelo modelo local `Xenova/paraphrase-multilingual-MiniLM-L12-v2` e executa recuperação semântica no MongoDB Vector Search.

## Contrato vetorial

```text
modelo: Xenova/paraphrase-multilingual-MiniLM-L12-v2
dimensões: 384
pooling: mean
normalização: true
campo: embedding
similaridade: cosine
```

Documentos, perguntas e índice precisam respeitar o contrato inteiro.

## Configuração

```bash
cp .env.example .env
docker compose up -d
npm ci
```

O Compose inicia `mongodb/mongodb-atlas-local:8.0` na porta `27017` e preserva banco, configuração e mongot em volumes Docker.

## Validação em ordem

```bash
npm run test:connection
npm run test:embedding
npm run seed
npm run index:create
npm run test:retriever
```

### O que cada comando faz

| Comando | Responsabilidade |
| --- | --- |
| `test:connection` | conecta, executa ping e mostra banco/collection configurados |
| `test:embedding` | baixa/carrega o modelo e exige vetor numérico de 384 dimensões |
| `seed` | gera embeddings de quatro documentos e faz upsert por `sourceId` |
| `index:create` | cria a collection se necessário, cria o índice se ausente e aguarda `READY` |
| `test:retriever` | executa `$vectorSearch` e apresenta quatro resultados |

O seed é repetível para seus quatro documentos. Ele não apaga toda a collection, mas atualiza registros que tenham os mesmos `sourceId`.

## Resultado de referência

Para:

```text
Qual tecnologia eu poderia usar para cache?
```

Redis deve aparecer no topo ou próximo dele. Scores podem variar sem indicar defeito.

## Cache do modelo

O Lab 3 configura o cache em `models/` dentro do próprio lab. A pasta está ignorada pelo Git e não deve ser versionada.

## Índice existente

`index:create` não substitui nem reconfigura um índice que já tenha o mesmo nome. Se ele já existir, confirme manualmente que está `READY`, consultável, usa o campo `embedding`, 384 dimensões e similaridade cosseno.
