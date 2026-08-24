# Dify + MongoDB RAG Lab

Projeto educacional para construir uma arquitetura de Retrieval-Augmented Generation (RAG) em etapas, mantendo visíveis e testáveis os seus componentes fundamentais.

O núcleo atual usa Node.js, embeddings locais, MongoDB Vector Search e Ollama. Dify e OpenWebUI fazem parte da evolução planejada, mas ainda não substituem a implementação local.

## O que existe no repositório

| Etapa | Diretório | Objetivo | Situação no fluxo atual |
| --- | --- | --- | --- |
| 1 | [`lab01-mongodb`](lab01-mongodb/README.md) | Conexão, carga e consulta de documentos no MongoDB | Fundamento de persistência |
| 2 | [`lab02-voyage`](lab02-voyage/README.md) | Experimento com embeddings externos e similaridade vetorial | Checkpoint histórico; requer Voyage AI |
| 3 | [`lab03-vector-search-local`](lab03-vector-search-local/README.md) | Embeddings locais de 384 dimensões e MongoDB Vector Search | Base local-first recomendada |
| 4 | [`lab04_llm_rag_local`](lab04_llm_rag_local/README.md) | Retriever, contexto, prompt, grounding e geração com Ollama | Núcleo RAG atual |

O Lab 2 é preservado como etapa de aprendizado. Novos trabalhos devem manter a direção local-first dos Labs 3 e 4, sem migrar embeddings para APIs externas a menos que isso seja solicitado explicitamente.

## Arquitetura atual

```text
Pergunta do usuário
        |
        v
Embedding local (MiniLM, 384 dimensões)
        |
        v
MongoDB Vector Search (cosseno)
        |
        v
Top-K documentos + corte de relevância
        |
        v
Context Builder -> Prompt Builder
        |
        v
Ollama (qwen2.5:3b)
        |
        v
Resposta fundamentada ou fallback
```

O contrato de grounding é explícito: uma resposta só deve usar o contexto recuperado. Quando não houver contexto suficiente, o retorno esperado é:

```text
Não há informação suficiente no contexto para responder.
```

Veja os componentes e contratos em [Arquitetura](docs/architecture.md).

## Requisitos

- Node.js 20.19 ou superior, conforme o requisito das dependências bloqueadas atualmente;
- npm;
- Docker com Docker Compose para executar o MongoDB Atlas Local do Lab 3, ou uma instância MongoDB compatível com Vector Search;
- Ollama para a geração do Lab 4;
- acesso à internet apenas na instalação inicial, no download/cache dos modelos e, se escolhido, no acesso ao MongoDB Atlas;
- credencial da Voyage AI somente para reproduzir o Lab 2 histórico.

O repositório não fixa a versão do Node em `.nvmrc`, `.node-version` ou `engines`. Confirme o ambiente antes de instalar:

```bash
node --version
npm --version
```

## Início rápido: núcleo local

### 1. Suba o MongoDB com Vector Search

```bash
cd lab03-vector-search-local
cp .env.example .env
docker compose up -d
npm ci
npm run test:connection
```

### 2. Valide embeddings, dados e busca

```bash
npm run test:embedding
npm run seed
npm run index:create
npm run test:retriever
```

O primeiro carregamento do modelo pode baixar arquivos e demorar mais. O teste do retriever usa a pergunta `Qual tecnologia eu poderia usar para cache?`; `Redis` deve aparecer no topo ou próximo dele.

### 3. Prepare o Ollama

```bash
ollama pull qwen2.5:3b
ollama list
curl http://localhost:11434/api/tags
```

### 4. Execute o RAG

Em outro terminal:

```bash
cd lab04_llm_rag_local
cp .env.example .env
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

O Lab 4 não possui seed nem criação de índice: ele reutiliza a base, a collection e o índice preparados pelo Lab 3. Os quatro valores `MONGODB_*` precisam apontar para os mesmos recursos.

## Variáveis de ambiente

Nunca versione arquivos `.env` ou credenciais reais. Os exemplos documentam somente os nomes esperados:

| Variável | Usada em | Finalidade |
| --- | --- | --- |
| `MONGODB_URI` | Labs 1–4 | URI de conexão com o MongoDB |
| `MONGODB_DB` | Labs 2–4 | Banco que contém os documentos vetorizados |
| `MONGODB_COLLECTION` | Labs 2–4 | Collection dos documentos |
| `MONGODB_VECTOR_INDEX` | Labs 3–4 | Nome do índice MongoDB Vector Search |
| `VOYAGE_API_KEY` | Lab 2 | Credencial da API externa usada no checkpoint histórico |

Os exemplos locais dos Labs 3 e 4 usam `rag_lab`, `documents` e `vector_index`. Não reutilize um índice antigo se suas dimensões ou seu modelo forem diferentes.

## Invariantes do Vector Search

Os seguintes elementos formam um único contrato e precisam permanecer compatíveis:

```text
modelo Xenova/paraphrase-multilingual-MiniLM-L12-v2
+ documentos armazenados com embeddings de 384 dimensões
+ perguntas convertidas em embeddings de 384 dimensões
+ campo embedding
+ índice com numDimensions = 384 e similarity = cosine
```

Trocar apenas uma dessas partes invalida a busca. A migração de modelo exige regenerar documentos e perguntas e adequar o índice de forma coordenada.

## Documentação

- [Arquitetura e contratos](docs/architecture.md)
- [Configuração, validação e solução de problemas](docs/setup-and-validation.md)
- [Lab 1 — MongoDB](lab01-mongodb/README.md)
- [Lab 2 — Voyage AI](lab02-voyage/README.md)
- [Lab 3 — Vector Search local](lab03-vector-search-local/README.md)
- [Lab 4 — RAG local](lab04_llm_rag_local/README.md)

## Próximas fases

Quando o núcleo RAG estiver validado camada por camada, a evolução prevista é:

```text
RAG Core -> API HTTP -> Dify -> OpenWebUI
```

A futura API deve chamar ou reutilizar o núcleo existente. Retriever, construção de contexto, prompt, LLM e fallback devem continuar executáveis e testáveis fora do Dify.
