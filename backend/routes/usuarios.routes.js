const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verifyToken } = require('../middleware/auth');

// Rutas que requieren autenticación (solo verificar token, sin restricciones de rol)
router.use(verifyToken);

// GET /api/usuarios/perfil - Obtener mi perfil
router.get('/perfil', usuariosController.getPerfil);

// PUT /api/usuarios/perfil - Actualizar mi perfil
router.put('/perfil', usuariosController.updatePerfil);

// PUT /api/usuarios/cambiar-password - Cambiar mi contraseña
router.put('/cambiar-password', usuariosController.cambiarPassword);

// GET /api/usuarios - Listar todos los usuarios (sin restricciones)
router.get('/', usuariosController.getUsuarios);

// GET /api/usuarios/:id - Obtener usuario específico (sin restricciones)
router.get('/:id', usuariosController.getUsuarioById);

// PUT /api/usuarios/:id - Actualizar usuario (sin restricciones)
router.put('/:id', usuariosController.updateUsuario);

// PUT /api/usuarios/:id/rol - Cambiar rol de usuario (sin restricciones)
router.put('/:id/rol', usuariosController.cambiarRol);

// DELETE /api/usuarios/:id - Eliminar usuario (sin restricciones)
router.delete('/:id', usuariosController.deleteUsuario);

module.exports = router;