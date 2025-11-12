// HealthCare_BackEnd/src/routes/perfilRoutes.js

const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/perfilController');
const authMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

// --- Rotas CRUD para Perfis ---

router.post(
  '/', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateProfileData(),
  PerfilController.createProfile
);

router.get(
  '/', 
  authMiddleware, 
  PerfilController.getAllUserProfiles
);

router.get(
  '/:profileId', 
  authMiddleware, 
  PerfilController.getProfileById
);

router.put(
  '/:profileId', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateProfileData(),
  PerfilController.updateProfile
);

router.delete(
  '/:profileId', 
  authMiddleware, 
  PerfilController.deleteProfile
);

// --- Rotas Adicionais para Dados Derivados ---

router.get(
  '/:profileId/status',
  authMiddleware,
  PerfilController.getProfileStatus 
);

router.get(
  '/:profileId/stats',
  authMiddleware,
  PerfilController.getProfileStats 
);


module.exports = router;