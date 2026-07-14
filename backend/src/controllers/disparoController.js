const prisma = require('../prismaClient');
const sleep = require('../utils/sleep');
const formatarTelefone = require('../utils/formatarTelefone');
const { executarWorkflowParaLead } = require('../utils/executarWorkflow');

function delayAleatorioEntreLeads() {
  const MIN_MS = 4000;
  const MAX_MS = 9000;
  return Math.floor(Math.random() * (MAX_MS - MIN_MS + 1)) + MIN_MS;
}

async function dispararAutomacao(req, res) {
  const { leadIds, workflowId, instanciaId, proximoWorkflowId } = req.body;

  if (!leadIds?.length || !workflowId || !instanciaId) {
    return res.status(400).json({ erro: 'leadIds, workflowId e instanciaId são obrigatórios' });
  }

  try {
    const workflow = await prisma.workflow.findUnique({ where: { id: Number(workflowId) } });
    const instancia = await prisma.whatsappInstance.findUnique({ where: { id: Number(instanciaId) } });
    const leads = await prisma.lead.findMany({ where: { id: { in: leadIds } } });

    if (!workflow || !instancia) {
      return res.status(404).json({ erro: 'Workflow ou instância não encontrados' });
    }

    res.status(202).json({ mensagem: 'Disparo iniciado', total: leads.length });

    const { nodes, edges } = workflow.estruturaJson;

    for (const lead of leads) {
      try {
        const telefoneFormatado = formatarTelefone(lead.telefone);
        await executarWorkflowParaLead(nodes, edges, instancia.nomeInstancia, telefoneFormatado);

        if (proximoWorkflowId) {
          // Fluxo em 2 fases: aguarda resposta do lead antes de continuar
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              status: 'Aguardando resposta',
              proximoWorkflowId: Number(proximoWorkflowId),
              instanciaAguardandoId: instancia.id,
            },
          });
          console.log(`✅ Lead ${lead.nome} recebeu 1ª mensagem, aguardando resposta`);
        } else {
          await prisma.lead.update({ where: { id: lead.id }, data: { status: 'Enviado' } });
          console.log(`✅ Lead ${lead.nome} processado com sucesso`);
        }
      } catch (erroLead) {
        console.error(`❌ Erro ao processar lead ${lead.nome}:`, JSON.stringify(erroLead.response?.data || erroLead.message, null, 2));
        await prisma.lead.update({ where: { id: lead.id }, data: { status: 'Erro' } });
      }

      const delayMs = delayAleatorioEntreLeads();
      console.log(`Aguardando ${(delayMs / 1000).toFixed(1)}s antes do próximo lead...`);
      await sleep(delayMs);
    }

    console.log('Disparo finalizado para todos os leads.');
  } catch (erro) {
    console.error(erro);
  }
}

module.exports = { dispararAutomacao };