import api from './api';

export async function login(email, senha) {
  const resposta = await api.post('/login', { email, senha });
  return resposta.data;
}