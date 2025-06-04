const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validações
const registerValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// Rotas
router.post('/register', registerValidation, UserController.register);
router.post('/login', loginValidation, UserController.login);
router.get('/profile', authMiddleware, UserController.getProfile);

module.exports = router;