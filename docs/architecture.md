# Arquitetura e contratos

## Objetivo arquitetural

O projeto expõe a equação do RAG de maneira didática:

```text
Embedding
+ Vector Search
+ Retriever
+ Context Builder
+ Prompt Builder
+ LLM
= RAG
```

Cada módulo do Lab 4 tem uma responsabilidade observável e pode ser validado antes da orquestração completa.

## Fluxo do núcleo RAG

```text
question: string
      |
      v
generateEmbedding(question)
      | number[384]
      v
retrieveDocuments(vector, topK, minScore)
      | Array<{ title, content, score }>
      v
buildContext(documents)
      | string
      v
buildRagPrompt(question, context)
      | string
      v
generateResponse(prompt)
      | string
      v
askRag -> { question, documents, context, answer }
```

Se o retriever não aceitar documentos acima do limite de relevância, `askRag` encerra o fluxo antes do Ollama e retorna o fallback.

## Componentes do Lab 4

### Embedding

Arquivo: `src/embedding.js`.

- modelo: `Xenova/paraphrase-multilingual-MiniLM-L12-v2`;
- execução: local, por `@xenova/transformers`;
- pooling: média;
- normalização: habilitada;
- saída esperada: vetor numérico com 384 posições;
- cache: gerenciado pela biblioteca no comportamento padrão do Lab 4.

### Retriever

Arquivo: `src/retriever.js`.

- recebe um vetor de exatamente 384 posições;
- consulta banco, collection e índice informados por ambiente;
- pesquisa o campo `embedding` com `$vectorSearch`;
- projeta apenas `title`, `content` e `score`;
- usa `topK = 3` e `minScore = 0.65` por padrão;
- amplia candidatos internamente antes de filtrar por score e limitar o resultado.

O score exato não é um contrato. A relevância semântica é: para a pergunta de referência sobre cache, Redis deve aparecer entre os melhores resultados.

### Context Builder

Arquivo: `src/context-builder.js`.

Transforma os documentos em blocos numerados contendo título e conteúdo, separados visualmente. Um array vazio gera uma string vazia; uma entrada que não seja array gera erro.

### Prompt Builder

Arquivo: `src/prompt-builder.js`.

Combina três partes:

```text
instruções de grounding
+ contexto recuperado
+ pergunta do usuário
```

As instruções obrigam uma resposta objetiva em português, proíbem invenções e definem o fallback.

### Adaptador do LLM

Arquivo: `src/llm.js`.

- endpoint: `http://localhost:11434/api/generate`;
- modelo: `qwen2.5:3b`;
- modo: resposta não streaming;
- entrada: prompt completo;
- saída: campo `response` devolvido pelo Ollama.

URL e modelo são constantes no código atual, não variáveis de ambiente.

### Orquestrador

Arquivo: `src/rag.js`.

`askRag(question, topK, minScore)` coordena as camadas e retorna:

```js
{
  question,
  documents,
  context,
  answer
}
```

Quando nenhum documento passa pelo corte de relevância, `documents` é vazio, `context` é uma string vazia e `answer` recebe o fallback sem chamar o LLM.

## Persistência e compatibilidade

O Lab 3 prepara os recursos consumidos pelo Lab 4:

- o seed usa upsert por `sourceId`, evitando duplicatas para os quatro documentos de exemplo;
- cada documento registra modelo e dimensão do embedding;
- o índice é criado apenas se ainda não existir;
- a criação configura `embedding`, 384 dimensões e similaridade cosseno;
- o processo aguarda o índice ficar `READY` e consultável.

Um índice existente não é automaticamente validado nem migrado pelo script. Antes de reutilizá-lo, confira seu path, dimensões, similaridade e status.

## Grounding e fallback

Há duas barreiras complementares:

1. o retriever remove resultados abaixo de `minScore`;
2. o prompt limita o LLM ao contexto fornecido.

O teste `test:grounding` pergunta pela capital da França, informação ausente da base de exemplo. `test:relevance` executa em sequência uma pergunta suportada e outra não suportada. O resultado esperado para a segunda é o fallback literal.

## Arquitetura de integração pretendida

```text
OpenWebUI
    |
    v
Dify
    |
    v
API HTTP (a implementar)
    |
    v
RAG Core
    +-------------------+
    |                   |
    v                   v
Retriever           LLM adapter
    |                   |
    v                   v
MongoDB              Ollama
```

Dify e OpenWebUI são camadas de integração e experiência. A lógica de retrieval e grounding deve permanecer no núcleo local e não ser duplicada dentro dessas ferramentas.
