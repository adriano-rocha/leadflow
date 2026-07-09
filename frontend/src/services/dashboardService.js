import api from './api';

export async function obterEstatisticas() {
  const resposta = await api.get('/dashboard');
  return resposta.data;
}