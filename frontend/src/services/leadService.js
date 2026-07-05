import api from './api';

export async function buscarLeads(segmento, cidade, limite) {
  const resposta = await api.post('/leads/buscar', { segmento, cidade, limite });
  return resposta.data;
}