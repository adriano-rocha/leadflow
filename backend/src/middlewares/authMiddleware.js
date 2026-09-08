const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }
 
  const [, token] = authHeader.split(' ');

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = dados.id; 
    return next(); 
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;