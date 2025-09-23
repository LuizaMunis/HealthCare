//src/routes/registroConsultaRoute.js

const express = require('express');
const router = express.Router();
const ConsultaController = require('../controllers/registroConsultaController');

// Middleware de autenticação para proteger as rotas
// Este é um exemplo de como seria usado. O arquivo real precisa ser criado.
const authMiddleware = require('../middlewares/authMiddleware'); 

// Aplicar o middleware de autenticação a todas as rotas de consulta
router.use(authMiddleware);

// --- Rotas para o CRUD de Consultas ---

// Rota para CRIAR uma nova consulta
// POST /api/consultas
router.post('/', ConsultaController.createConsulta);

// Rota para LER (GET) todas as consultas do usuário logado
// GET /api/consultas
router.get('/', ConsultaController.getAllConsultas);

// Rota para LER (GET) uma consulta específica por ID
// GET /api/consultas/123
router.get('/:id', ConsultaController.getConsultaById);

// Rota para ATUALIZAR (UPDATE) uma consulta por ID
// PUT /api/consultas/123
router.put('/:id', ConsultaController.updateConsulta);

// Rota para DELETAR uma consulta por ID
// DELETE /api/consultas/123
router.delete('/:id', ConsultaController.deleteConsulta);

module.exports = router;