// backend/src/routes/glicemiaRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const GlicemiaController = require('../controllers/glicemiaController');
const auth = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

router.use(auth);

router.post('/', ValidationMiddleware.sanitizeInput, GlicemiaController.createRegistro);
router.get('/', GlicemiaController.getAll);
router.get('/:registroId', GlicemiaController.getById);
router.put('/:registroId', ValidationMiddleware.sanitizeInput, GlicemiaController.update);
router.delete('/:registroId', GlicemiaController.remove);

module.exports = router;


