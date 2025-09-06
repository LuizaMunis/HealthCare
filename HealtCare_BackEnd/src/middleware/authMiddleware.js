// backend/src/middleware/authMiddleware.js
const UserService = require('../services/userService');

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

    const decoded = UserService.verifyToken(token);
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