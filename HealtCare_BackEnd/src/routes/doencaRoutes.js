// backend/src/routes/doencaRoute.js
const express = require('express');
const router = express.Router();
const DoencaController = require('../controllers/doencaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// --- Rotas para o CRUD de Doenças ---
router.post('/', DoencaController.createDoenca);
router.get('/', DoencaController.getAllDoencas);
router.get('/:id', DoencaController.getDoencaById);
router.put('/:id', DoencaController.updateDoenca);
router.delete('/:id', DoencaController.deleteDoenca);

// --- Rotas Aninhadas para os Sintomas de uma Doença ---

// Adicionar um sintoma a uma doença específica
// POST /api/doencas/45/sintomas
router.post('/:doencaId/sintomas', DoencaController.addSintoma);

// Listar todos os sintomas de uma doença específica
// GET /api/doencas/45/sintomas
router.get('/:doencaId/sintomas', DoencaController.getSintomasByDoenca);

module.exports = router;