// src/routes/consultaRoute.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const ConsultaController = require('../controllers/registroConsultaController');
const authMiddleware = require('../middleware/authMiddleware'); 

router.use(authMiddleware);

router.post('/', ConsultaController.createConsulta);
router.get('/', ConsultaController.getAllConsultas);
router.get('/:consultaId', ConsultaController.getConsultaById);
router.put('/:consultaId', ConsultaController.updateConsulta);
router.delete('/:consultaId', ConsultaController.deleteConsulta);

module.exports = router;