// backend/src/routes/doencaRoute.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const DoencaController = require('../controllers/doencaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/:profileId', DoencaController.createDoenca);

router.get('/:profileId', DoencaController.getAllDoencasByProfile);

router.get('/:profileId/:doencaId', DoencaController.getDoencaById);

router.put('/:profileId/:doencaId', DoencaController.updateDoenca);

router.delete('/:profileId/:doencaId', DoencaController.deleteDoenca);

router.post('/:profileId/:doencaId/symptoms', DoencaController.addSintomaToDoenca);

router.get('/:profileId/:doencaId/symptoms', DoencaController.getSintomasByDoenca);

module.exports = router;