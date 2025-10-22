// backend/src/routes/vacinaRoute.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const VacinaController = require('../controllers/vacinaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', VacinaController.createVacina);
router.get('/', VacinaController.getAllVacinas);
router.get('/:vacinaId', VacinaController.getVacinaById);
router.put('/:vacinaId', VacinaController.updateVacina);
router.delete('/:vacinaId', VacinaController.deleteVacina);

module.exports = router;