const express = require('express');
const { salvarWorkflow, listarWorkflows, buscarWorkflowPorId, excluirWorkflow } = require('../controllers/workflowController');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', autenticar, salvarWorkflow);
router.get('/', autenticar, listarWorkflows);
router.get('/:id', autenticar, buscarWorkflowPorId);
router.delete('/:id', autenticar, excluirWorkflow);

module.exports = router;