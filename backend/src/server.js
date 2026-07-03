require("dotenv").config();
const express = require("express");
const usuarioRoutes = require("./routes/usuarioRoutes");
const loginRoutes = require("./routes/loginRoutes");

const app = express();

app.use(express.json());

app.use("/usuarios", usuarioRoutes);
app.use("/login", loginRoutes);

const autenticar = require("./middlewares/authMiddleware");

app.get("/teste-protegido", autenticar, (req, res) => {
  res.json({ mensagem: "Você está autenticado!", usuarioId: req.usuarioId });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
