// HealthCare_BackEnd/src/routes/perfilRoutes.js

const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/perfilController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, PerfilController.getProfile);

router.post('/', authMiddleware, PerfilController.saveProfile);

module.exports = router;
