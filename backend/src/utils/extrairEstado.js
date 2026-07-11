// backend/src/utils/extrairEstado.js
function extrairEstado(endereco) {
  if (!endereco) return 'Não informado';
  const match = endereco.match(/- ([A-Z]{2}),/);
  return match ? match[1] : 'Não informado';
}

module.exports = extrairEstado;