const prisma = require('../prismaClient');

async function salvarWorkflow(req, res) {
  const { nome, estruturaJson } = req.body;
  const usuarioId = req.usuarioId;

  if (!nome || !estruturaJson) {
    return res.status(400).json({ erro: 'Nome e estrutura são obrigatórios' });
  }

  try {
    const novoWorkflow = await prisma.workflow.create({
      data: {
        nome,
        estruturaJson,
        usuarioId,
      },
    });

    return res.status(201).json({ workflow: novoWorkflow });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao salvar workflow' });
  }
}

async function listarWorkflows(req, res) {
  const usuarioId = req.usuarioId;

  try {
    const workflows = await prisma.workflow.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
    });
    return res.json({ workflows });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar workflows' });
  }
}

async function buscarWorkflowPorId(req, res) {
  const { id } = req.params;

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: Number(id) },
    });

    if (!workflow) {
      return res.status(404).json({ erro: 'Workflow não encontrado' });
    }

    return res.json({ workflow });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar workflow' });
  }
}

async function excluirWorkflow(req, res) {
  const { id } = req.params;

  try {
    await prisma.workflow.delete({
      where: { id: Number(id) },
    });
    return res.json({ mensagem: 'Workflow excluído com sucesso' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao excluir workflow' });
  }
}

module.exports = { salvarWorkflow, listarWorkflows, buscarWorkflowPorId, excluirWorkflow };