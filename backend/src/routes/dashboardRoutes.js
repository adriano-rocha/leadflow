const express = require('express');
const { obterEstatisticas } = require('../controllers/dashboardController');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, obterEstatisticas);

module.exports = router;