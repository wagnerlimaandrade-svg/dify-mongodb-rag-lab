import { askRag } from './rag.js';

async function main() {
  try {
    const question = 'Qual tecnologia eu poderia usar para cache?';

    console.log('================================');
    console.log('        RAG LOCAL - LAB 4');
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
    console.log('RESPOSTA RAG');
    console.log('================================\n');

    console.log(result.answer);

    console.log('\n================================');
  } catch (error) {
    console.error('\nErro durante execução do RAG:');
    console.error(error);
  }
}

main();
