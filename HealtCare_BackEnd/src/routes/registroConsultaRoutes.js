// src/routes/consultaRoute.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const ConsultaController = require('../controllers/registroConsultaController');
const authMiddleware = require('../middleware/authMiddleware');

<<<<<<< HEAD
// Middleware de autenticação para proteger as rotas
// Este é um exemplo de como seria usado. O arquivo real precisa ser criado.
const authMiddleware = require('../middleware/authMiddleware'); 

// Aplicar o middleware de autenticação a todas as rotas de consulta
=======
>>>>>>> silvaerikdaniel
router.use(authMiddleware);

router.post('/', ConsultaController.createConsulta);
router.get('/', ConsultaController.getAllConsultasByProfile);
router.get('/:consultaId', ConsultaController.getConsultaById);
router.put('/:consultaId', ConsultaController.updateConsulta);
router.delete('/:consultaId', ConsultaController.deleteConsulta);

module.exports = router;