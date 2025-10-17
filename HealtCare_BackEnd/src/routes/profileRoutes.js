// HealthCare_BackEnd/src/routes/perfilRoutes.js

const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

// --- Rotas CRUD para Perfis ---

router.post(
  '/', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateProfileData(),
  ProfileController.createProfile
);

router.get(
  '/', 
  authMiddleware, 
  ProfileController.getAllUserProfiles
);

router.get(
  '/:profileId', 
  authMiddleware, 
  ProfileController.getProfileById
);

router.put(
  '/:profileId', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateProfileData(),
  ProfileController.updateProfile
);

router.delete(
  '/:profileId', 
  authMiddleware, 
  ProfileController.deleteProfile
);

// --- Rotas Adicionais para Dados Derivados ---

router.get(
  '/:profileId/status',
  authMiddleware,
  ProfileController.getProfileStatus 
);

router.get(
  '/:profileId/stats',
  authMiddleware,
  ProfileController.getProfileStats 
);

module.exports = router;