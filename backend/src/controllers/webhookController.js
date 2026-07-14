const prisma = require('../prismaClient');
const { executarWorkflowParaLead } = require('../utils/executarWorkflow');

function extrairTelefoneDoJid(remoteJid) {
  // remoteJid vem tipo "5511999999999@s.whatsapp.net"
  return remoteJid.split('@')[0];
}

async function receberWebhook(req, res) {
  // Responde rápido pra Evolution API não ficar esperando
  res.status(200).json({ ok: true });

  try {
    const evento = req.body;
    const dados = evento?.data;

    if (!dados || dados.key?.fromMe) {
      return; // ignora eventos que não são mensagem recebida, ou mensagens que nós mesmos enviamos
    }

    const telefoneRecebido = extrairTelefoneDoJid(dados.key?.remoteJid || '');
    if (!telefoneRecebido) return;

    // Busca um lead aguardando resposta com telefone terminando igual (compara só os dígitos finais, mais seguro)
    const leadsAguardando = await prisma.lead.findMany({
      where: { status: 'Aguardando resposta' },
    });

    const lead = leadsAguardando.find((l) => {
      const telefoneLead = l.telefone.replace(/\D/g, '');
      return telefoneRecebido.endsWith(telefoneLead.slice(-8)); // compara os últimos 8 dígitos
    });

    if (!lead || !lead.proximoWorkflowId || !lead.instanciaAguardandoId) return;

    const workflow = await prisma.workflow.findUnique({ where: { id: lead.proximoWorkflowId } });
    const instancia = await prisma.whatsappInstance.findUnique({ where: { id: lead.instanciaAguardandoId } });

    if (!workflow || !instancia) return;

    const { nodes, edges } = workflow.estruturaJson;
    const formatarTelefone = require('../utils/formatarTelefone');
    const telefoneFormatado = formatarTelefone(lead.telefone);

    await executarWorkflowParaLead(nodes, edges, instancia.nomeInstancia, telefoneFormatado);

    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'Enviado', proximoWorkflowId: null, instanciaAguardandoId: null },
    });

    console.log(`✅ Lead ${lead.nome} respondeu — 2ª fase enviada com sucesso`);
  } catch (erro) {
    console.error('❌ Erro ao processar webhook:', erro.message);
  }
}

module.exports = { receberWebhook };