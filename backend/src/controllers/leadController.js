const axios = require("axios");
const prisma = require("../prismaClient");

async function buscarLeads(req, res) {
  const { segmento, cidade, limite } = req.body;
  const usuarioId = req.usuarioId; // vem do middleware de autenticação

  if (!segmento || !cidade) {
    return res.status(400).json({ erro: "Segmento e cidade são obrigatórios" });
  }

  try {
    // 1. Chama a API do scraper Python
    const scraperUrl = process.env.SCRAPER_URL || "http://localhost:8000";
    const respostaScraper = await axios.post(`${scraperUrl}/buscar`, {
      segmento,
      cidade,
      limite: limite || 10,
    });

    const leadsEncontrados = respostaScraper.data.leads;
    const leadsSalvos = [];

    // 2. Para cada lead encontrado, verifica duplicado e salva
    for (const lead of leadsEncontrados) {
      const jaExiste = await prisma.lead.findFirst({
        where: {
          telefone: lead.telefone,
          nome: lead.nome,
          usuarioId,
        },
      });

      if (jaExiste) {
        continue; // pula esse, já existe
      }

      const novoLead = await prisma.lead.create({
        data: {
          nome: lead.nome,
          telefone: lead.telefone,
          endereco: lead.endereco,
          segmento,
          cidade,
          urlSite: lead.url_site,
          temSiteProprio: lead.tem_site_proprio,
          avaliacao: lead.avaliacao ?? 0,
          usuarioId,
        },
      });

      leadsSalvos.push(novoLead);
    }

    // Ranking: menor nota primeiro (quem mais precisa de site em destaque)
    leadsSalvos.sort((a, b) => a.avaliacao - b.avaliacao);

    return res.status(201).json({
      total_encontrados: leadsEncontrados.length,
      total_novos: leadsSalvos.length,
      leads: leadsSalvos,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao buscar leads" });
  }
}

async function listarLeads(req, res) {
  const usuarioId = req.usuarioId;
  const { segmento, status } = req.query;

  try {
    const where = { usuarioId };
    if (segmento) where.segmento = segmento;
    if (status) where.status = status;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { avaliacao: "asc" },
    });
    return res.json({ leads });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao listar leads" });
  }
}

async function excluirLeads(req, res) {
  const { leadIds } = req.body;
  const usuarioId = req.usuarioId;

  if (!leadIds?.length) {
    return res.status(400).json({ erro: "leadIds é obrigatório" });
  }

  try {
    await prisma.lead.deleteMany({
      where: {
        id: { in: leadIds },
        usuarioId, // garante que só exclui leads do próprio usuário
      },
    });

    return res.json({ mensagem: "Leads excluídos com sucesso" });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao excluir leads" });
  }
}

module.exports = { buscarLeads, listarLeads, excluirLeads };