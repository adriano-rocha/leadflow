const express = require('express');
const { buscarLeads } = require('../controllers/leadController');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/buscar', autenticar, buscarLeads);

module.exports = router;