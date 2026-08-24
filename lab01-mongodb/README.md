# Lab 1 — Fundamentos de MongoDB

Primeiro checkpoint do projeto: conectar ao MongoDB, inserir documentos de conhecimento e executar uma consulta por metadados.

## Configuração

Este lab usa CommonJS e lê apenas `MONGODB_URI`. As dependências `mongodb` e `dotenv` estão declaradas no `package.json` da raiz, portanto instale-as a partir da raiz do repositório:

```bash
cd ..
npm install
cd lab01-mongodb
cp .env.example .env
```

## Execução

```bash
node src/test-connection.js
node src/seed.js
node src/query.js
```

- `test-connection.js` executa um ping no banco `admin`;
- `seed.js` grava três chunks em `corporate_ai.knowledge_chunks`;
- `query.js` lista documentos cujo `metadata.department` é `Segurança`.

## Atenção: seed destrutivo

Antes de inserir os três exemplos, `seed.js` executa `deleteMany({})` em toda a collection `corporate_ai.knowledge_chunks`. Use somente em uma base de laboratório na qual os dados existentes possam ser descartados.

Este lab não cria embeddings nem executa busca vetorial.
