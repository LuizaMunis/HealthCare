// backend/src/routes/frequenciaCardiacaRoute.js
const express = require('express');
const router = express.Router();
const FrequenciaCardiacaController = require('../controllers/frequenciaCardiacaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// --- Rotas para o CRUD de Frequência Cardíaca ---

// POST /api/frequencia-cardiaca -> Criar um novo registro
router.post('/', FrequenciaCardiacaController.createRegistro);

// GET /api/frequencia-cardiaca -> Listar todos os registros do usuário
router.get('/', FrequenciaCardiacaController.getAllRegistros);

// GET /api/frequencia-cardiaca/:id -> Obter um registro específico
router.get('/:id', FrequenciaCardiacaController.getRegistroById);

// PUT /api/frequencia-cardiaca/:id -> Atualizar um registro
router.put('/:id', FrequenciaCardiacaController.updateRegistro);

// DELETE /api/frequencia-cardiaca/:id -> Deletar um registro
router.delete('/:id', FrequenciaCardiacaController.deleteRegistro);

module.exports = router;