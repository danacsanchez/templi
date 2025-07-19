const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rutas públicas (no requieren autenticación)
router.get('/tipos-usuario', authController.getTiposUsuario);
router.get('/generos', authController.getGeneros);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;