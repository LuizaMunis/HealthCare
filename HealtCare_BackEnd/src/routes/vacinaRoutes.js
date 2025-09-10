// backend/src/routes/vacinaRoute.js

const express = require('express');
const router = express.Router();
const VacinaController = require('../controllers/vacinaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege todas as rotas de vacinas com autenticação
router.use(authMiddleware);

// --- Rotas para o CRUD de Vacinas ---

// POST /api/vacinas -> Criar um novo registro de vacina
router.post('/', VacinaController.createVacina);

// GET /api/vacinas -> Listar todos os registros de vacina do usuário
router.get('/', VacinaController.getAllVacinas);

// GET /api/vacinas/:id -> Obter um registro específico
router.get('/:id', VacinaController.getVacinaById);

// PUT /api/vacinas/:id -> Atualizar um registro
router.put('/:id', VacinaController.updateVacina);

// DELETE /api/vacinas/:id -> Deletar um registro
router.delete('/:id', VacinaController.deleteVacina);

module.exports = router;