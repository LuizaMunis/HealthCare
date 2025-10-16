// backend/src/routes/temperaturaRoute.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const TemperaturaController = require('../controllers/temperaturaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', TemperaturaController.createRegistro);
router.get('/', TemperaturaController.getAllRegistrosByProfile);
router.get('/:registroId', TemperaturaController.getRegistroById);
router.put('/:registroId', TemperaturaController.updateRegistro);
router.delete('/:registroId', TemperaturaController.deleteRegistro);

module.exports = router;