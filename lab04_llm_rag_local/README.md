# Lab 4 — RAG local com Ollama

Núcleo RAG atual. Ele combina o embedding local com a busca preparada pelo Lab 3, constrói contexto e prompt, aplica grounding e usa um LLM local via Ollama.

## Dependência do Lab 3

Este lab não contém seed nem criação de índice. Antes de executá-lo, conclua no Lab 3:

```bash
npm run test:embedding
npm run seed
npm run index:create
npm run test:retriever
```

Copie a configuração e mantenha banco, collection e índice iguais nos dois labs:

```bash
cp .env.example .env
npm ci
```

## Ollama

O adaptador atual usa valores fixos no código:

```text
endpoint: http://localhost:11434/api/generate
modelo: qwen2.5:3b
```

Prepare e confira o serviço:

```bash
ollama pull qwen2.5:3b
ollama list
curl http://localhost:11434/api/tags
```

## Componentes

| Arquivo | Responsabilidade |
| --- | --- |
| `src/embedding.js` | gera embedding local normalizado |
| `src/retriever.js` | busca documentos, filtra por score e limita Top-K |
| `src/context-builder.js` | organiza documentos em contexto textual |
| `src/prompt-builder.js` | adiciona regras, contexto, pergunta e fallback |
| `src/llm.js` | chama o endpoint local do Ollama |
| `src/rag.js` | orquestra o fluxo e encerra cedo sem contexto relevante |

O padrão de `askRag` é Top-3 com score mínimo `0.65`.

## Validação em camadas

```bash
npm run test:embedding
npm run test:retriever
npm run test:context
npm run test:prompt
npm run test:llm
npm run test:rag
npm run test:grounding
npm run test:relevance
```

- `test:rag` usa a pergunta de referência sobre cache;
- `test:grounding` usa uma pergunta fora da base;
- `test:relevance` executa os dois cenários na mesma validação.

O fallback esperado é exatamente:

```text
Não há informação suficiente no contexto para responder.
```

Se nenhum documento atingir `0.65`, o orquestrador retorna o fallback sem consultar o Ollama. Se documentos forem aceitos, o prompt também instrui o LLM a usar exclusivamente o contexto.
