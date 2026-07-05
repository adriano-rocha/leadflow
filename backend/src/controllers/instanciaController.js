const axios = require('axios');
const prisma = require('../prismaClient');

const evolutionApi = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    apikey: process.env.EVOLUTION_API_KEY,
  },
});

async function criarInstancia(req, res) {
  const { nomeInstancia } = req.body;
  const usuarioId = req.usuarioId;

  if (!nomeInstancia) {
    return res.status(400).json({ erro: 'Nome da instância é obrigatório' });
  }

  try {
    // 1. Pede pra Evolution API criar a instância
    const respostaEvolution = await evolutionApi.post('/instance/create', {
      instanceName: nomeInstancia,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    });

    // 2. Salva no nosso banco, guardando o vínculo com o usuário
    const novaInstancia = await prisma.whatsappInstance.create({
      data: {
        nomeInstancia,
        status: 'aguardando_qrcode',
        usuarioId,
      },
    });

    // 3. Devolve o QR Code (vem dentro da resposta da Evolution)
    return res.status(201).json({
      instancia: novaInstancia,
      qrcode: respostaEvolution.data.qrcode?.base64,
    });
  } catch (erro) {
    console.error(erro.response?.data || erro.message);
    return res.status(500).json({ erro: 'Erro ao criar instância' });
  }
}

async function listarInstancias(req, res) {
  const usuarioId = req.usuarioId;

  try {
    const instancias = await prisma.whatsappInstance.findMany({
      where: { usuarioId },
    });
    return res.json({ instancias });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar instâncias' });
  }
}

async function verificarStatus(req, res) {
  const { nomeInstancia } = req.params;

  try {
    const resposta = await evolutionApi.get(`/instance/connectionState/${nomeInstancia}`);
    const estado = resposta.data.instance?.state;

    // Atualiza no nosso banco também
    const statusTraduzido = estado === 'open' ? 'conectado' : 'aguardando_qrcode';

    await prisma.whatsappInstance.updateMany({
      where: { nomeInstancia },
      data: { status: statusTraduzido },
    });

    return res.json({ status: statusTraduzido });
  } catch (erro) {
    console.error(erro.response?.data || erro.message);
    return res.status(500).json({ erro: 'Erro ao verificar status' });
  }
}

module.exports = { criarInstancia, listarInstancias, verificarStatus };