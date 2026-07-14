const express = require('express');
const { receberWebhook } = require('../controllers/webhookController');

const router = express.Router();

// SEM middleware de autenticação — quem chama é a Evolution API, não um usuário logado
router.post('/evolution', receberWebhook);

module.exports = router;