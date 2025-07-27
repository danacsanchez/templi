const express = require('express');
const router = express.Router();
const tipoUsuariosController = require('../controllers/tipoUsuarios.controller');

// Rutas públicas (catálogo fijo, no necesita autenticación compleja)

// GET /api/tipo-usuarios - Obtener todos los tipos de usuario
router.get('/', tipoUsuariosController.getTiposUsuario);

// GET /api/tipo-usuarios/:id - Obtener tipo de usuario por ID (opcional)
router.get('/:id', tipoUsuariosController.getTipoUsuarioById);

module.exports = router;
