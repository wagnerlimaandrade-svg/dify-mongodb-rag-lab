import { askRag } from './rag.js';

async function main() {
  try {
    const question = 'Qual é a capital da França?';

    console.log('================================');
    console.log('     TESTE DE GROUNDING');
    console.log('================================');

    console.log('\nPergunta:');
    console.log(question);

    const result = await askRag(question, 3);

    console.log('\n================================');
    console.log('DOCUMENTOS RECUPERADOS');
    console.log('================================\n');

    result.documents.forEach((document, index) => {
      console.log(
        `${index + 1}. ${document.title} - score: ${document.score.toFixed(4)}`
      );
    });

    console.log('\n================================');
    console.log('RESPOSTA DO RAG');
    console.log('================================\n');

    console.log(result.answer);

    console.log('\n================================');
  } catch (error) {
    console.error('\nErro durante teste de grounding:');
    console.error(error);
  }
}

main();
