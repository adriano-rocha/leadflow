const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }
  
  // O header vem no formato "Bearer TOKEN_AQUI", pegamos só o token
  const [, token] = authHeader.split(' ');

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = dados.id; // deixa disponível pros próximos controllers
    return next(); // deixa a requisição seguir
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;