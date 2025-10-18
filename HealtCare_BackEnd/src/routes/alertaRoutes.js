// src/routes/alertaRoutes.js
const express = require('express');
const router = express.Router();
const AlertaController = require('../controllers/alertaController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplica o middleware de autenticação a todas as rotas de alertas
router.use(authMiddleware);

// Rota para buscar todos os alertas de um perfil específico
// O ID do perfil virá da URL
router.get('/perfil/:perfilId', AlertaController.getAlertasPorPerfil);

// Rota para marcar um alerta específico como visualizado
router.post('/:alertaId/visualizar', AlertaController.marcarAlertaComoVisualizado);

// Rota para marcar TODOS os alertas de um perfil como visualizados
router.post('/perfil/:perfilId/visualizar-todos', AlertaController.marcarTodosComoVisualizados);

// Rota para deletar um alerta
router.delete('/:alertaId', AlertaController.deletarAlerta);

module.exports = router;