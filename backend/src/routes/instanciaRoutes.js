const express = require('express');
const { criarInstancia, listarInstancias, verificarStatus } = require('../controllers/instanciaController');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', autenticar, criarInstancia);
router.get('/', autenticar, listarInstancias);
router.get('/:nomeInstancia/status', autenticar, verificarStatus);

module.exports = router;