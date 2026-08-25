import Fastify from 'fastify';
import 'dotenv/config';
import { askRag } from './rag.js';

const app = Fastify({
  logger: true,
});

app.get('/health', async () => {
  return {
    status: 'ok',
  };
});

app.post('/api/rag', async (request, reply) => {
  try {
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.RAG_API_KEY) {
      return reply.status(401).send({
        error: 'Unauthorized',
      });
    }

    const { question } = request.body ?? {};

    if (!question || typeof question !== 'string') {
      return reply.status(400).send({
        error: 'question deve ser uma string válida.',
      });
    }

    const result = await askRag(
      question,
      3,
      0.65
    );

    return {
      question: result.question,
      answer: result.answer,

      documents: result.documents.map((document) => ({
        title: document.title,
        score: document.score,
      })),
    };
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      error: 'Erro interno ao executar o RAG.',
    });
  }
});

async function start() {
  try {
    await app.listen({
      port: 3001,
      host: '0.0.0.0',
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();