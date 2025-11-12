// backend/src/routes/medicamentoRoute.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const MedicamentoController = require('../controllers/medicamentoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', MedicamentoController.createMedicamento);
router.get('/', MedicamentoController.getAllMedicamentosByProfile);
router.get('/:medicamentoId', MedicamentoController.getMedicamentoById);
router.put('/:medicamentoId', MedicamentoController.updateMedicamento);
router.delete('/:medicamentoId', MedicamentoController.deleteMedicamento);

router.post('/:medicamentoId/usage-logs', MedicamentoController.registrarUsoMedicamento);
router.get('/:medicamentoId/usage-logs', MedicamentoController.getHistoricoDeUso);

module.exports = router;