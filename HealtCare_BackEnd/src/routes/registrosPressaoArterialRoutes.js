// backend/src/routes/registrosPressaoArterialRoutes.js
const express = require('express');
const router = express.Router();
const RegistroPressaoArterialController = require('../controllers/registroPressaoArterialController');
const authMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

// Todas as rotas abaixo são protegidas por autenticação

// Rota para criar um novo registro de pressão arterial para o perfil do usuário autenticado
router.post('/', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateBloodPressure(),
  RegistroPressaoArterialController.createRegistro
);

// Rota para obter todos os registros de pressão arterial do perfil do usuário autenticado
router.get('/', authMiddleware, RegistroPressaoArterialController.getRegistros);

// Rota para atualizar um registro de pressão arterial específico (/:id refere-se ao ID do registro)
router.put('/:id', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateBloodPressure(),
  RegistroPressaoArterialController.updateRegistro
);

// Rota para deletar um registro de pressão arterial específico (/:id refere-se ao ID do registro)
router.delete('/:id', authMiddleware, RegistroPressaoArterialController.deleteRegistro);

module.exports = router;
