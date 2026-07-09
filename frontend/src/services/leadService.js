import api from './api';

export async function buscarLeads(segmento, cidade, limite) {
  const resposta = await api.post('/leads/buscar', { segmento, cidade, limite });
  return resposta.data;
}

export async function listarLeads(filtros = {}) {
  const resposta = await api.get('/leads', { params: filtros });
  return resposta.data;
}

export async function excluirLeads(leadIds) {
  const resposta = await api.delete('/leads', { data: { leadIds } });
  return resposta.data;
}