// backend/src/routes/doencaRoute.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const DoencaController = require('../controllers/doencaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', DoencaController.createDoenca);

router.get('/', DoencaController.getAllDoencasByProfile);

router.get('/:doencaId', DoencaController.getDoencaById);

router.put('/:doencaId', DoencaController.updateDoenca);

router.delete('/:doencaId', DoencaController.deleteDoenca);

router.post('/:doencaId/symptoms', DoencaController.addSintomaToDoenca);

router.get('/:doencaId/symptoms', DoencaController.getSintomasByDoenca);

module.exports = router;