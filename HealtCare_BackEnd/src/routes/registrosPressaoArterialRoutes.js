// backend/src/routes/registrosPressaoArterialRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const RegistroPressaoArterialController = require('../controllers/registroPressaoArterialController');
const authMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

router.post(
  '/',
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateBloodPressure(),
  RegistroPressaoArterialController.createRegistro
);

router.get(
  '/',
  authMiddleware,
  RegistroPressaoArterialController.getRegistrosByProfile
);

router.put(
  '/:registroId',
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateBloodPressure(),
  RegistroPressaoArterialController.updateRegistro
);

router.delete(
  '/:registroId',
  authMiddleware,
  RegistroPressaoArterialController.deleteRegistro
);

module.exports = router;