// backend/src/routes/sintomaRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const SintomaController = require('../controllers/sintomaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas para sintomas por perfil
router.get('/', SintomaController.getAllSintomasByProfile);
router.post('/:doencaId/symptoms', SintomaController.createSintoma);

// Rotas para sintomas específicos
router.get('/:sintomaId', SintomaController.getSintomaById);
router.put('/:sintomaId', SintomaController.updateSintoma);
router.delete('/:sintomaId', SintomaController.deleteSintoma);

// Rota para sintomas por doença específica
router.get('/doenca/:doencaId/symptoms', SintomaController.getAllSintomasByDoenca);

module.exports = router;
