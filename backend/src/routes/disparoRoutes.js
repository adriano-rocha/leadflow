const express = require('express');
const { dispararAutomacao } = require('../controllers/disparoController');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', autenticar, dispararAutomacao);

module.exports = router;