const prisma = require('../prismaClient');
const extrairEstado = require('../utils/extrairEstado');

async function obterEstatisticas(req, res) {
  const usuarioId = req.usuarioId;

  try {
    // Busca todos os leads do usuário de uma vez (é um cálculo local, não precisa de várias queries)
    const leads = await prisma.lead.findMany({
      where: { usuarioId },
    });

    // 1. Contagem por status (funil simples)
    const porStatus = {
      Novo: 0,
      Enviado: 0,
      Erro: 0,
    };
    leads.forEach((lead) => {
      if (porStatus[lead.status] !== undefined) {
        porStatus[lead.status]++;
      }
    });

    // 2. Contagem por segmento/nicho
    const porSegmentoMap = {};
    leads.forEach((lead) => {
      const chave = lead.segmento || 'Não informado';
      porSegmentoMap[chave] = (porSegmentoMap[chave] || 0) + 1;
    });
    const porSegmento = Object.entries(porSegmentoMap)
      .map(([segmento, total]) => ({ segmento, total }))
      .sort((a, b) => b.total - a.total);

    // 3. Contagem por cidade
    const porCidadeMap = {};
    leads.forEach((lead) => {
      const chave = lead.cidade || 'Não informado';
      porCidadeMap[chave] = (porCidadeMap[chave] || 0) + 1;
    });
    const porCidade = Object.entries(porCidadeMap)
      .map(([cidade, total]) => ({ cidade, total }))
      .sort((a, b) => b.total - a.total);

    // 3.5. Contagem por estado (extraído do endereço)
    const porEstadoMap = {};
    leads.forEach((lead) => {
      const uf = extrairEstado(lead.endereco);
      porEstadoMap[uf] = (porEstadoMap[uf] || 0) + 1;
    });
    const porEstado = Object.entries(porEstadoMap)
      .map(([estado, total]) => ({ estado, total }))
      .sort((a, b) => b.total - a.total);

    // 4. Top 10 leads mais prioritários (nota baixa + poucas avaliações = mais urgente)
    //    Só considera leads que têm avaliação registrada e ainda não foram trabalhados (status Novo)
    const leadsComAvaliacao = leads.filter(
      (lead) => lead.avaliacao !== null && lead.status === 'Novo'
    );

    const topPrioritarios = leadsComAvaliacao
      .slice()
      .sort((a, b) => a.avaliacao - b.avaliacao)
      .slice(0, 10);

    // 5. Totais gerais
    const totalLeads = leads.length;
    const totalSemSite = leads.filter((lead) => !lead.temSiteProprio).length;

    return res.json({
      totalLeads,
      totalSemSite,
      porStatus,
      porSegmento,
      porCidade,
      porEstado,
      topPrioritarios,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao calcular estatísticas' });
  }
}

module.exports = { obterEstatisticas };