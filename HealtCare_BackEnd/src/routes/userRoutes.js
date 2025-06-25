// HealthCare_Back-End/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', authMiddleware, UserController.getProfile);
router.get('/all', authMiddleware, UserController.getAllUsers);

// --- NOVAS ROTAS ---
router.put('/profile', authMiddleware, UserController.updateProfile);
router.post('/change-password', authMiddleware, UserController.changePassword);

module.exports = router;
