// backend/src/routes/medicamentoRoute.js

const express = require('express');
const router = express.Router();
const MedicamentoController = require('../controllers/medicamentoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// --- Rotas para o CRUD do Medicamento ---
router.post('/', MedicamentoController.createMedicamento);
router.get('/', MedicamentoController.getAllMedicamentos);
router.get('/:id', MedicamentoController.getMedicamentoById);
router.put('/:id', MedicamentoController.updateMedicamento);
router.delete('/:id', MedicamentoController.deleteMedicamento);

// --- Novas Rotas Aninhadas para o Registro de Uso ---

// Rota para REGISTRAR o uso de um medicamento específico
// Ex: POST /api/medicamentos/123/registros
router.post('/:medicamentoId/registros', MedicamentoController.registrarUsoMedicamento);

// Rota para OBTER o histórico de uso de um medicamento específico
// Ex: GET /api/medicamentos/123/registros
router.get('/:medicamentoId/registros', MedicamentoController.getHistoricoDeUso);

module.exports = router;