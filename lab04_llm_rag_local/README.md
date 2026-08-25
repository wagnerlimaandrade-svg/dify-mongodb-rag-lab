# Lab 4 — RAG local com Ollama, MongoDB, Fastify e Dify

Núcleo RAG local do projeto. Este lab combina embedding local, MongoDB Vector Search, construção de contexto, grounding, LLM local via Ollama e uma API HTTP consumível pelo Dify.

## Arquitetura atual

```text
Pergunta
   ↓
Embedding local
Xenova/paraphrase-multilingual-MiniLM-L12-v2
   ↓
vetor de 384 dimensões
   ↓
MongoDB Vector Search
   ↓
Top-K + threshold de relevância
   ↓
Context Builder
   ↓
Prompt Builder
   ↓
Ollama / qwen2.5:3b
   ↓
Resposta
```

A partir do Passo 11, o RAG também é exposto como serviço HTTP:

```text
Cliente HTTP / Dify
        ↓
POST /api/rag
        ↓
Fastify
        ↓
rag.js
   ┌────┴────┐
   ↓         ↓
MongoDB    Ollama
```

## Dependência do Lab 3

Este lab não contém seed nem criação de índice. Antes de executá-lo, conclua no Lab 3:

```bash
npm run test:embedding
npm run seed
npm run index:create
npm run test:retriever
```

Mantenha banco, collection, índice, modelo e dimensão compatíveis entre os dois labs.

Exemplo de configuração:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/?directConnection=true
MONGODB_DB=rag_lab
MONGODB_COLLECTION=documents
MONGODB_VECTOR_INDEX=vector_index
```

O índice vetorial deve usar embeddings de 384 dimensões gerados com:

```text
Xenova/paraphrase-multilingual-MiniLM-L12-v2
```

## Preparação após reiniciar a máquina

O Lab 4 depende de serviços locais. Depois de reiniciar o computador, valide primeiro o MongoDB e o Ollama.

### MongoDB Atlas Local

Liste os containers:

```bash
docker ps -a
```

Se o container estiver parado:

```bash
docker start <CONTAINER_ID_O_MONGODB>
```

Confirme que a porta está publicada:

```bash
docker ps
ss -ltn | grep 27017
```

O RAG espera o MongoDB em:

```text
127.0.0.1:27017
```

Um erro como:

```text
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

normalmente indica que o container MongoDB está parado ou que a porta `27017` não está disponível.

### Ollama

O adaptador atual usa:

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

Se necessário:

```bash
ollama serve
```

Em instalações configuradas como serviço:

```bash
systemctl status ollama
```

## Componentes

| Arquivo | Responsabilidade |
| --- | --- |
| `src/embedding.js` | gera embedding local normalizado de 384 dimensões |
| `src/retriever.js` | executa MongoDB Vector Search, aplica score mínimo e limita Top-K |
| `src/context-builder.js` | organiza documentos recuperados em contexto textual |
| `src/prompt-builder.js` | adiciona regras, contexto, pergunta e fallback |
| `src/llm.js` | chama o endpoint local do Ollama |
| `src/rag.js` | orquestra o RAG e encerra cedo quando não há contexto relevante |
| `src/server.js` | expõe o RAG por HTTP usando Fastify |

O padrão atual de `askRag` é:

```text
Top-K: 3
score mínimo: 0.65
```

O score `0.65` é experimental e adequado apenas aos testes atuais. Ele deve ser calibrado com um conjunto maior de perguntas relevantes e irrelevantes antes de qualquer uso de produção.

## Grounding e threshold

O pipeline possui duas barreiras contra respostas sem sustentação documental.

### 1. Threshold no Retriever

```text
Vector Search
    ↓
score >= 0.65?
  ┌─┴─┐
 não  sim
  ↓    ↓
STOP  contexto
```

Se nenhum documento atingir o score mínimo, o LLM não é consultado.

### 2. Regras no Prompt

Quando há contexto, o prompt instrui o modelo a:

1. usar apenas as informações presentes no contexto;
2. não inventar informações;
3. responder em português;
4. retornar o fallback quando não houver informação suficiente.

O fallback esperado é exatamente:

```text
Não há informação suficiente no contexto para responder.
```

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

### Cenário relevante

Pergunta:

```text
Qual tecnologia eu poderia usar para cache?
```

Resultado validado:

```text
Redis - score aproximado: 0.7455
```

O documento Redis passa pelo threshold e o LLM responde com base no contexto recuperado.

### Cenário fora da base

Pergunta:

```text
Qual é a capital da França?
```

Resultado validado:

```text
Documentos relevantes: 0
```

Resposta:

```text
Não há informação suficiente no contexto para responder.
```

Nesse caso o Ollama não é chamado.

## API HTTP do RAG

O Passo 11 transforma o RAG em um serviço HTTP com Fastify.

Instalação:

```bash
npm install fastify
```

Script esperado no `package.json`:

```json
{
  "scripts": {
    "start": "node src/server.js"
  }
}
```

Suba a API:

```bash
npm start
```

Endpoint local:

```text
http://localhost:3001
```

### Health check

```bash
curl http://localhost:3001/health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

### POST /api/rag

Corpo:

```json
{
  "question": "Qual tecnologia eu poderia usar para cache?"
}
```

Resposta esperada:

```json
{
  "question": "Qual tecnologia eu poderia usar para cache?",
  "answer": "Você poderia usar Redis para cache com base no contexto fornecido.",
  "documents": [
    {
      "title": "Redis",
      "score": 0.7455
    }
  ]
}
```

Para uma pergunta fora da base:

```json
{
  "question": "Qual é a capital da França?",
  "answer": "Não há informação suficiente no contexto para responder.",
  "documents": []
}
```

## Proteção da API

A rota `/api/rag` utiliza uma chave simples enviada pelo header `x-api-key`.

Gere uma chave local:

```bash
openssl rand -hex 32
```

Adicione ao `.env`:

```env
RAG_API_KEY=SUA_CHAVE
```

O `.env` deve permanecer fora do Git:

```gitignore
node_modules/
.env
```

Chamada autorizada:

```bash
curl -X POST http://localhost:3001/api/rag \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE" \
  -d '{
    "question": "Qual tecnologia eu poderia usar para cache?"
  }'
```

Sem o header correto, a API deve retornar `401 Unauthorized`.

## Cloudflare Quick Tunnel

Como o Dify Cloud não consegue acessar `localhost:3001` diretamente, o Lab 4 usa temporariamente um Cloudflare Quick Tunnel.

Com a API local em execução:

```bash
cloudflared tunnel --url http://localhost:3001
```

O comando gera uma URL temporária semelhante a:

```text
https://<nome-temporario>.trycloudflare.com
```

A rota pública do RAG passa a ser:

```text
https://<nome-temporario>.trycloudflare.com/api/rag
```

Valide o túnel antes de envolver o Dify:

```bash
curl -X POST https://<nome-temporario>.trycloudflare.com/api/rag \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE" \
  -d '{
    "question": "Qual tecnologia eu poderia usar para cache?"
  }'
```

O Quick Tunnel é temporário e adequado ao laboratório. Para produção, use um túnel nomeado/persistente e uma estratégia de autenticação apropriada.

## Integração com Dify

O Passo 12 conecta o Dify Cloud à API RAG local.

Arquitetura atual:

```text
Dify Cloud
    ↓
HTTP Request
    ↓
Cloudflare Quick Tunnel
    ↓
Fastify /api/rag
    ↓
RAG local
    ↓
MongoDB + Ollama
    ↓
Dify
```

### Workflow

Fluxo inicial:

```text
INICIAR
  ↓
REQUISIÇÃO HTTP
  ↓
OUTPUT
```

### Nó INICIAR

Campo configurado:

```text
Tipo: Texto Curto
Nome da variável: question
Rótulo: Pergunta
Obrigatório: sim
Comprimento máximo: 150
```

Para perguntas maiores, o campo pode ser evoluído posteriormente para texto longo/parágrafo.

### Nó REQUISIÇÃO HTTP

Configuração:

```text
Método:
POST

URL:
https://<nome-temporario>.trycloudflare.com/api/rag
```

Headers:

```text
Content-Type: application/json
x-api-key: SUA_CHAVE
```

Body JSON:

```json
{
  "question": "<variável Iniciar.question>"
}
```

A variável deve ser inserida usando o seletor de variáveis do Dify, e não escrita manualmente como texto fixo.

### Validação realizada

O workflow foi testado com:

```text
Qual tecnologia eu poderia usar para cache?
```

Os nós `INICIAR` e `REQUISIÇÃO HTTP` concluíram com status `SUCCESS`.

Isso valida o caminho:

```text
Dify Cloud
    ↓
Cloudflare
    ↓
API Fastify local
    ↓
RAG
    ↓
MongoDB Vector Search
    ↓
Ollama
```

## Status atual do Passo 12

Concluído:

- API Fastify local;
- `/health`;
- `/api/rag`;
- autenticação por `x-api-key`;
- Cloudflare Quick Tunnel;
- chamada externa via `curl`;
- variável `question` no Dify;
- nó HTTP Request configurado;
- chamada Dify → API RAG executada com sucesso.

Próximo ponto:

```text
REQUISIÇÃO HTTP
       ↓
      body
       ↓
OUTPUT
```

O próximo nó deve expor inicialmente o `body` completo retornado pelo HTTP Request. Depois, o workflow pode evoluir para extrair apenas o campo:

```text
answer
```

## Próximas evoluções

### Passo 13 — Dify como orquestrador de conhecimento

Evoluir de:

```text
Dify
 ↓
RAG API completa
 ├── retrieval
 └── geração
```

para:

```text
Dify
   ↓
External Knowledge / Retriever externo
   ↓
Node.js
   ↓
MongoDB Vector Search
   ↓
documentos
   ↓
Dify
   ↓
LLM
   ↓
resposta
```

Nesse modelo, o Node.js/MongoDB ficam responsáveis principalmente pelo retrieval e o Dify assume a orquestração e a geração final.

### Passo 14 — OpenWebUI

Arquitetura alvo:

```text
OpenWebUI
    ↓
Dify
    ↓
MongoDB / RAG
    ↓
LLM
```

A meta é chegar ao Assistente Técnico Corporativo com:

- interface de chat no OpenWebUI;
- orquestração no Dify;
- conhecimento recuperado do MongoDB;
- embedding e/ou inferência local quando aplicável;
- APIs externas integradas progressivamente.

## Quick start atual

Depois de reiniciar a máquina:

```bash
# 1. MongoDB
docker ps -a
docker start <CONTAINER_ID_O_MONGODB>

# 2. Ollama
curl http://localhost:11434/api/tags

# 3. API RAG
cd lab04_llm_rag_local
npm start

# 4. Em outro terminal, valide
curl http://localhost:3001/health

# 5. Se for usar Dify Cloud
cloudflared tunnel --url http://localhost:3001
```

Mantenha ativos durante a integração:

```text
MongoDB Atlas Local :27017
Ollama              :11434
Fastify RAG API     :3001
Cloudflare Tunnel   :HTTPS temporário
```
