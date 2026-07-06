const express = require('express');
const { criarInstancia, listarInstancias, verificarStatus, excluirInstancia } = require('../controllers/instanciaController');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', autenticar, criarInstancia);
router.get('/', autenticar, listarInstancias);
router.get('/:nomeInstancia/status', autenticar, verificarStatus);
router.delete('/:id', autenticar, excluirInstancia);

module.exports = router;