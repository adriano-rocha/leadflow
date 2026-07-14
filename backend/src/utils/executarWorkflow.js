const axios = require('axios');
const sleep = require('./sleep');

const evolutionApi = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: { apikey: process.env.EVOLUTION_API_KEY },
});

async function enviarMensagemTexto(nomeInstancia, telefone, texto) {
  await evolutionApi.post(`/message/sendText/${nomeInstancia}`, {
    number: telefone,
    text: texto,
  });
}

async function enviarImagem(nomeInstancia, telefone, urlImagem, legenda) {
  await evolutionApi.post(`/message/sendMedia/${nomeInstancia}`, {
    number: telefone,
    mediatype: 'image',
    media: urlImagem,
    caption: legenda,
  });
}

async function executarWorkflowParaLead(nodes, edges, nomeInstancia, telefone) {
  const noInicial = nodes.find((n) => n.type === 'inicio');
  let noAtualId = noInicial.id;

  while (true) {
    const aresta = edges.find((e) => e.source === noAtualId);
    if (!aresta) break;

    const proximoNo = nodes.find((n) => n.id === aresta.target);
    if (!proximoNo) break;

    if (proximoNo.type === 'mensagem') {
      await enviarMensagemTexto(nomeInstancia, telefone, proximoNo.data.texto);
    }
    if (proximoNo.type === 'delay') {
      const segundos = proximoNo.data.segundos || 3;
      await sleep(segundos * 1000);
    }
    if (proximoNo.type === 'imagem') {
      await enviarImagem(nomeInstancia, telefone, proximoNo.data.urlImagem, proximoNo.data.legenda);
    }

    noAtualId = proximoNo.id;
  }
}

module.exports = { executarWorkflowParaLead, evolutionApi };