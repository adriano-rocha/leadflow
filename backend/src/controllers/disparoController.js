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
  // Monta um "mapa" pra saber qual nó vem depois de qual
  const noInicial = nodes.find((n) => n.type === "inicio");
  let noAtualId = noInicial.id;

  console.log("Nós do workflow:", JSON.stringify(nodes));
  console.log("Conexões do workflow:", JSON.stringify(edges));

  while (true) {
    const aresta = edges.find((e) => e.source === noAtualId);
    if (!aresta) break; // não tem próximo nó, terminou o fluxo

    const proximoNo = nodes.find((n) => n.id === aresta.target);
    if (!proximoNo) break;

    if (proximoNo.type === "mensagem") {
      console.log(
        "Texto da mensagem a enviar:",
        JSON.stringify(proximoNo.data.texto),
      );
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

    // Responde imediatamente pro frontend, e continua processando em segundo plano
    res.status(202).json({ mensagem: "Disparo iniciado", total: leads.length });

    const { nodes, edges } = workflow.estruturaJson;

    for (const lead of leads) {
      try {
        const telefoneFormatado = formatarTelefone(lead.telefone);
        console.log("Telefone formatado:", telefoneFormatado);
        console.log("Nome da instância usada:", instancia.nomeInstancia);

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

      // Delay de segurança entre um lead e outro
      await sleep(5000);
    }

    console.log("Disparo finalizado para todos os leads.");
  } catch (erro) {
    console.error(erro);
    // Como já respondemos antes, só logamos o erro geral aqui
  }
}

module.exports = { dispararAutomacao };
