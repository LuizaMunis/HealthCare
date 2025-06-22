// backend/src/routes/perfilRoutes.js
const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/perfilController');
const authMiddleware = require('../middleware/authMiddleware'); // Necessário para rotas protegidas

// Rotas protegidas para o perfil do usuário
// Todas essas rotas exigirão um token JWT válido
router.post('/', authMiddleware, PerfilController.createProfile); // Criar perfil
router.get('/', authMiddleware, PerfilController.getProfile);     // Obter perfil
router.put('/', authMiddleware, PerfilController.updateProfile);   // Atualizar perfil
router.delete('/', authMiddleware, PerfilController.deleteProfile); // Deletar perfil

module.exports = router;