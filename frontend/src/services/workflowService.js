import api from './api';

export async function salvarWorkflow(nome, estruturaJson) {
  const resposta = await api.post('/workflows', { nome, estruturaJson });
  return resposta.data;
}

export async function listarWorkflows() {
  const resposta = await api.get('/workflows');
  return resposta.data;
}

export async function buscarWorkflowPorId(id) {
  const resposta = await api.get(`/workflows/${id}`);
  return resposta.data;
}