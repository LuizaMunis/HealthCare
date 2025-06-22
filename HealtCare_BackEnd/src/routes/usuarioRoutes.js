// backend/src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware'); // Reutilizando o middleware

// Rota pública para registrar um novo usuário
router.post('/register', UsuarioController.register);

// Rota pública para login (você precisará criar/adaptar a função de login no controller)
// router.post('/login', UsuarioController.login);

// Exemplo de rota protegida
// router.get('/profile', authMiddleware, UsuarioController.getProfile);

module.exports = router;
