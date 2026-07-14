const axios = require("axios");
const prisma = require("../prismaClient");

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
    return res.status(400).json({ erro: "Nome da instância é obrigatório" });
  }

  try {
    const respostaEvolution = await evolutionApi.post("/instance/create", {
      instanceName: nomeInstancia,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
    });

    const novaInstancia = await prisma.whatsappInstance.create({
      data: {
        nomeInstancia,
        status: "aguardando_qrcode",
        usuarioId,
      },
    });

    return res.status(201).json({
      instancia: novaInstancia,
      qrcode: respostaEvolution.data.qrcode?.base64,
    });
  } catch (erro) {
    console.error(erro.response?.data || erro.message);
    return res.status(500).json({ erro: "Erro ao criar instância" });
  }
}

await evolutionApi.post(`/webhook/set/${nomeInstancia}`, {
  webhook: {
    url: `${process.env.BACKEND_URL}/webhook/evolution`,
    events: ["MESSAGES_UPSERT"],
    enabled: true,
    webhookByEvents: false,
  },
});

async function listarInstancias(req, res) {
  const usuarioId = req.usuarioId;

  try {
    const instancias = await prisma.whatsappInstance.findMany({
      where: { usuarioId },
    });
    return res.json({ instancias });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao listar instâncias" });
  }
}

async function verificarStatus(req, res) {
  const { nomeInstancia } = req.params;

  try {
    const resposta = await evolutionApi.get(
      `/instance/connectionState/${nomeInstancia}`,
    );
    const estado = resposta.data.instance?.state;

    const statusTraduzido =
      estado === "open" ? "conectado" : "aguardando_qrcode";

    await prisma.whatsappInstance.updateMany({
      where: { nomeInstancia },
      data: { status: statusTraduzido },
    });

    return res.json({ status: statusTraduzido });
  } catch (erro) {
    console.error(erro.response?.data || erro.message);
    return res.status(500).json({ erro: "Erro ao verificar status" });
  }
}

async function excluirInstancia(req, res) {
  const { id } = req.params;

  try {
    await prisma.whatsappInstance.delete({
      where: { id: Number(id) },
    });
    return res.json({ mensagem: "Instância excluída com sucesso" });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao excluir instância" });
  }
}

module.exports = {
  criarInstancia,
  listarInstancias,
  verificarStatus,
  excluirInstancia,
};
