// HealthCare_BackEnd/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

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

router.get('/profile', 
  authMiddleware, 
  UserController.getProfile
);

router.get('/profiles', 
  authMiddleware, 
  UserController.getUserProfiles 
);

router.put('/update-user', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateProfileUpdate(), 
  //UserController.updateProfile
);

router.post('/change-password', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validatePasswordChange(),
  UserController.changePassword
);

// Rotas de recuperação de senha (não requerem autenticação)
router.post('/forgot-password',
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateForgotPassword(),
  UserController.forgotPassword
);

router.post('/verify-code',
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateVerifyCode(),
  UserController.verifyCode
);

router.post('/reset-password',
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateResetPassword(),
  UserController.resetPassword
);

//router.get('/all', authMiddleware, UserController.getAllUsers);

module.exports = router;