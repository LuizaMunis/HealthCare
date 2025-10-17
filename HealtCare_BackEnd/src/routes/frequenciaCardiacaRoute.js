// backend/src/routes/frequenciaCardiacaRoute.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const FrequenciaCardiacaController = require('../controllers/frequenciaCardiacaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', FrequenciaCardiacaController.createRegistro);
router.get('/', FrequenciaCardiacaController.getAllRegistrosByProfile);
router.get('/:registroId', FrequenciaCardiacaController.getRegistroById);
router.put('/:registroId', FrequenciaCardiacaController.updateRegistro);
router.delete('/:registroId', FrequenciaCardiacaController.deleteRegistro);

module.exports = router;