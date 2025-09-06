// HealthCare_Back-End/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

// Rotas públicas com validação
router.post('/register', 
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateUserRegistration(),
  UserController.register
);

router.post('/login', 
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateUserLogin(),
  UserController.login
);

// Rotas protegidas
router.get('/profile', authMiddleware, UserController.getProfile);
router.get('/all', authMiddleware, UserController.getAllUsers);

// Rotas protegidas com validação
router.put('/profile', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateProfileUpdate(),
  UserController.updateProfile
);

router.post('/change-password', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validatePasswordChange(),
  UserController.changePassword
);

module.exports = router;
