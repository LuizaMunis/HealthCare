// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    console.log('Headers recebidos:', req.headers);
    const authHeader = req.header('Authorization');
    console.log('Authorization header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Token extraído:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      console.log('Token não encontrado no header');
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido no middleware!');
      return res.status(500).json({
        success: false,
        message: 'Erro de configuração do servidor'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado com sucesso:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = authMiddleware;