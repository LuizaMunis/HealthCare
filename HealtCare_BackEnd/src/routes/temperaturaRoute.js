// backend/src/routes/temperaturaRoute.js
const express = require('express');
const router = express.Router();
const TemperaturaController = require('../controllers/temperaturaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// --- Rotas para o CRUD de Temperatura ---

// POST /api/temperatura -> Criar um novo registro
router.post('/', TemperaturaController.createRegistro);

// GET /api/temperatura -> Listar todos os registros do usuário
router.get('/', TemperaturaController.getAllRegistros);

// GET /api/temperatura/:id -> Obter um registro específico
router.get('/:id', TemperaturaController.getRegistroById);

// PUT /api/temperatura/:id -> Atualizar um registro
router.put('/:id', TemperaturaController.updateRegistro);

// DELETE /api/temperatura/:id -> Deletar um registro
router.delete('/:id', TemperaturaController.deleteRegistro);

module.exports = router;