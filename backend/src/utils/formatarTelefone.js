function formatarTelefone(telefone) {
  // Remove tudo que não for número (parênteses, espaço, traço, etc.)
  let apenasNumeros = telefone.replace(/\D/g, '');

  // Se não começar com o código do Brasil (55), adiciona
  if (!apenasNumeros.startsWith('55')) {
    apenasNumeros = '55' + apenasNumeros;
  }

  return apenasNumeros;
}

module.exports = formatarTelefone;