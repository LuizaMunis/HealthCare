// HealthCare_BackEnd/src/routes/perfilRoutes.js

const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/perfilController');
const authMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, PerfilController.getProfile);

router.post('/', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateProfileData(),
  PerfilController.saveProfile
);

module.exports = router;
