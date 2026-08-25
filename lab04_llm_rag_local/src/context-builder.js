export function buildContext(documents) {
  if (!Array.isArray(documents)) {
    throw new Error('documents deve ser um array.');
  }

  if (documents.length === 0) {
    return '';
  }

  return documents
    .map((document, index) => {
      const title = document.title ?? 'Sem título';
      const content = document.content ?? '';

      return [
        `Documento ${index + 1}`,
        `Título: ${title}`,
        'Conteúdo:',
        content,
      ].join('\n');
    })
    .join('\n\n---\n\n');
}