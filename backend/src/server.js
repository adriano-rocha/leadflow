require("dotenv").config();
const express = require("express");
const cors = require('cors');
const usuarioRoutes = require("./routes/usuarioRoutes");
const loginRoutes = require("./routes/loginRoutes");
const leadRoutes = require('./routes/leadRoutes');
const instanciaRoutes = require('./routes/instanciaRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const disparoRoutes = require('./routes/disparoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", usuarioRoutes);
app.use("/login", loginRoutes);
app.use('/leads', leadRoutes);
app.use('/instancias', instanciaRoutes);
app.use('/workflows', workflowRoutes);
app.use('/disparo', disparoRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/webhook', webhookRoutes);

const autenticar = require("./middlewares/authMiddleware");

app.get("/teste-protegido", autenticar, (req, res) => {
  res.json({ mensagem: "Você está autenticado!", usuarioId: req.usuarioId });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
