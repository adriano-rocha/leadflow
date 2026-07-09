const axios = require("axios");
const prisma = require("../prismaClient");
const sleep = require("../utils/sleep");
const formatarTelefone = require("../utils/formatarTelefone");

const evolutionApi = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    apikey: process.env.EVOLUTION_API_KEY,
  },
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
    mediatype: "image",
    media: urlImagem,
    caption: legenda,
  });
}

async function executarWorkflowParaLead(nodes, edges, nomeInstancia, telefone) {
  const noInicial = nodes.find((n) => n.type === "inicio");
  let noAtualId = noInicial.id;

  while (true) {
    const aresta = edges.find((e) => e.source === noAtualId);
    if (!aresta) break;

    const proximoNo = nodes.find((n) => n.id === aresta.target);
    if (!proximoNo) break;

    if (proximoNo.type === "mensagem") {
      await enviarMensagemTexto(nomeInstancia, telefone, proximoNo.data.texto);
    }

    if (proximoNo.type === "delay") {
      const segundos = proximoNo.data.segundos || 3;
      await sleep(segundos * 1000);
    }

    if (proximoNo.type === "imagem") {
      await enviarImagem(
        nomeInstancia,
        telefone,
        proximoNo.data.urlImagem,
        proximoNo.data.legenda,
      );
    }

    noAtualId = proximoNo.id;
  }
}

/**
 * Gera um delay aleatório entre um mínimo e um máximo (em milissegundos).
 * Usado entre o disparo de um lead e outro, para evitar um padrão de
 * tempo sempre idêntico (comportamento que sistemas anti-spam identificam
 * facilmente).
 */
function delayAleatorioEntreLeads() {
  const MIN_MS = 4000;
  const MAX_MS = 9000;
  return Math.floor(Math.random() * (MAX_MS - MIN_MS + 1)) + MIN_MS;
}

async function dispararAutomacao(req, res) {
  const { leadIds, workflowId, instanciaId } = req.body;

  if (!leadIds?.length || !workflowId || !instanciaId) {
    return res
      .status(400)
      .json({ erro: "leadIds, workflowId e instanciaId são obrigatórios" });
  }

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: Number(workflowId) },
    });
    const instancia = await prisma.whatsappInstance.findUnique({
      where: { id: Number(instanciaId) },
    });
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
    });

    if (!workflow || !instancia) {
      return res
        .status(404)
        .json({ erro: "Workflow ou instância não encontrados" });
    }

    res.status(202).json({ mensagem: "Disparo iniciado", total: leads.length });

    const { nodes, edges } = workflow.estruturaJson;

    for (const lead of leads) {
      try {
        const telefoneFormatado = formatarTelefone(lead.telefone);

        await executarWorkflowParaLead(
          nodes,
          edges,
          instancia.nomeInstancia,
          telefoneFormatado,
        );

        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "Enviado" },
        });

        console.log(`✅ Lead ${lead.nome} processado com sucesso`);
      } catch (erroLead) {
        console.error(
          `❌ Erro ao processar lead ${lead.nome}:`,
          erroLead.response?.data || erroLead.message,
        );
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "Erro" },
        });
      }

      // Delay variável de segurança entre um lead e outro (4 a 9 segundos)
      const delayMs = delayAleatorioEntreLeads();
      console.log(`Aguardando ${(delayMs / 1000).toFixed(1)}s antes do próximo lead...`);
      await sleep(delayMs);
    }

    console.log("Disparo finalizado para todos os leads.");
  } catch (erro) {
    console.error(erro);
  }
}

module.exports = { dispararAutomacao };