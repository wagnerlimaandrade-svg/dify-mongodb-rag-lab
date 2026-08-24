# Configuração, validação e solução de problemas

## Preparação de uma nova máquina

Execute a configuração na ordem abaixo. Cada etapa depende da anterior.

### 1. Inspecione o repositório e o runtime

```bash
git status
node --version
npm --version
```

As dependências bloqueadas atualmente exigem Node.js 20.19 ou superior.

### 2. Instale as dependências do lab ativo

Nos Labs 2, 3 e 4, use `npm ci`, pois há lockfile. O Lab 1 atualmente depende dos pacotes instalados na raiz:

```bash
npm install
```

Não copie `node_modules` de outra máquina e não o versione.

### 3. Configure o ambiente

Copie o exemplo dentro do lab que será executado:

```bash
cp .env.example .env
```

Edite apenas o `.env`. Nunca adicione URI com senha, chaves ou tokens aos exemplos ou ao Git.

### 4. Inicie o MongoDB compatível com Vector Search

O Lab 3 fornece MongoDB Atlas Local 8.0:

```bash
cd lab03-vector-search-local
docker compose up -d
docker compose ps
```

Os dados persistem nos volumes nomeados `mongodb_data`, `mongodb_config` e `mongodb_mongot`. Derrubar os containers não exige remover esses volumes.

### 5. Valide cada camada

```bash
npm run test:connection
npm run test:embedding
npm run seed
npm run index:create
npm run test:retriever
```

Antes do seed, confirme a base e a collection configuradas. O seed do Lab 3 é repetível para os quatro `sourceId` conhecidos e atualiza os documentos por upsert.

### 6. Valide o Ollama e o RAG

```bash
ollama --version
ollama pull qwen2.5:3b
ollama list
curl http://localhost:11434/api/tags
```

Depois, no Lab 4:

```bash
npm ci
npm run test:embedding
npm run test:retriever
npm run test:context
npm run test:prompt
npm run test:llm
npm run test:rag
npm run test:grounding
npm run test:relevance
```

## Matriz de validação

| Camada | Comando | Evidência esperada |
| --- | --- | --- |
| MongoDB | `npm run test:connection` no Lab 3 | ping bem-sucedido e nomes configurados |
| Embedding | `npm run test:embedding` no Lab 3 ou 4 | vetor com 384 dimensões |
| Seed | `npm run seed` no Lab 3 | quatro embeddings gerados e upserts concluídos |
| Índice | `npm run index:create` no Lab 3 | status `READY` e `queryable=true` |
| Retriever | `npm run test:retriever` | Redis entre os primeiros resultados para a pergunta de cache |
| Contexto | `npm run test:context` no Lab 4 | blocos numerados com título e conteúdo |
| Prompt | `npm run test:prompt` no Lab 4 | instruções, contexto e pergunta presentes |
| LLM | `npm run test:llm` no Lab 4 | resposta recebida de `qwen2.5:3b` |
| RAG | `npm run test:rag` no Lab 4 | documentos e resposta fundamentada |
| Fallback | `npm run test:grounding` e `npm run test:relevance` | texto de fallback para pergunta fora da base |

Não considere o núcleo saudável somente porque o LLM respondeu. Cada camada acima precisa produzir sua própria evidência.

## Ordem de diagnóstico

Quando o fluxo completo falhar, investigue de baixo para cima:

```text
1. Variáveis de ambiente
2. Conexão MongoDB
3. Documentos de origem
4. Carga do modelo de embedding
5. Dimensão do embedding
6. Embeddings armazenados
7. Índice Vector Search
8. Embedding da pergunta
9. Retriever
10. Context Builder
11. Prompt Builder
12. Ollama / LLM
13. Orquestração RAG
```

## Problemas comuns

### O modelo demora na primeira execução

O arquivo do modelo local ainda precisa ser baixado e armazenado em cache. Garanta conectividade na primeira execução e espaço em disco. Não versione o cache.

### O índice existe, mas a busca falha

Confira no mesmo índice usado pela aplicação:

```text
status = READY
queryable = true
path = embedding
numDimensions = 384
similarity = cosine
```

O script de criação não altera um índice existente. Um índice criado para os embeddings do Lab 2 pode ter dimensão incompatível com os Labs 3 e 4.

### Redis não aparece perto do topo

Verifique primeiro o modelo, as 384 dimensões dos vetores armazenados e da pergunta, o campo `embedding` e a configuração do índice. Scores podem variar; o ranking semanticamente correto é o critério.

### O RAG responde algo fora da base

Execute `npm run test:relevance`. Revise os documentos aceitos e seus scores antes de alterar o prompt. Se documentos irrelevantes passarem pelo corte, investigue retrieval e `minScore`. Se não houver documentos, o código deve retornar o fallback antes de chamar o Ollama.

### O Ollama não responde

Confirme serviço, endpoint e modelo:

```bash
curl http://localhost:11434/api/tags
ollama list
```

O Lab 4 espera `qwen2.5:3b` em `localhost:11434`.

## Segurança das operações de dados

- O seed do Lab 1 executa `deleteMany({})` em `corporate_ai.knowledge_chunks` antes de inserir os exemplos. Não o execute contra uma collection com dados que precisem ser preservados.
- O seed do Lab 3 faz upsert direcionado por `sourceId` e não remove toda a collection.
- A criação do índice do Lab 3 é não destrutiva quando encontra outro índice com o mesmo nome: ela informa o estado e encerra.
- Não remova volumes, collections ou índices para diagnosticar uma incompatibilidade sem confirmar o alvo e o impacto.
