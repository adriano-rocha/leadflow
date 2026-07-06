const express = require('express');
const { buscarLeads, listarLeads, excluirLeads } = require('../controllers/leadController');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/buscar', autenticar, buscarLeads);
router.get('/', autenticar, listarLeads);
router.delete('/', autenticar, excluirLeads);

module.exports = router;