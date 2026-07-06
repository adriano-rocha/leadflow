import api from './api';

export async function criarInstancia(nomeInstancia) {
  const resposta = await api.post('/instancias', { nomeInstancia });
  return resposta.data;
}

export async function verificarStatus(nomeInstancia) {
  const resposta = await api.get(`/instancias/${nomeInstancia}/status`);
  return resposta.data;
}

export async function excluirInstancia(id) {
  const resposta = await api.delete(`/instancias/${id}`);
  return resposta.data;
}