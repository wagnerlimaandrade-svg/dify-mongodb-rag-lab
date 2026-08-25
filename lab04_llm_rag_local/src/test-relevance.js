import { askRag } from './rag.js';

async function test(question) {
  console.log('\n================================');
  console.log('PERGUNTA');
  console.log('================================');

  console.log(question);

  const result = await askRag(
    question,
    3,
    0.65
  );

  console.log('\nDOCUMENTOS ACEITOS:');

  if (result.documents.length === 0) {
    console.log('Nenhum documento relevante.');
  } else {
    result.documents.forEach((document, index) => {
      console.log(
        `${index + 1}. ${document.title} - ${document.score.toFixed(4)}`
      );
    });
  }

  console.log('\nRESPOSTA:');
  console.log(result.answer);
}

async function main() {
  try {
    await test(
      'Qual tecnologia eu poderia usar para cache?'
    );

    await test(
      'Qual é a capital da França?'
    );
  } catch (error) {
    console.error(error);
  }
}

main();