const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { 
  verifyToken, 
  requireAdmin, 
  requireSuperAdmin, 
  requireSelfOrAdmin 
} = require('../middleware/auth');

// Rutas que requieren autenticación
router.use(verifyToken);

// GET /api/usuarios/perfil - Obtener mi perfil
router.get('/perfil', usuariosController.getPerfil);

// PUT /api/usuarios/perfil - Actualizar mi perfil
router.put('/perfil', usuariosController.updatePerfil);

// PUT /api/usuarios/cambiar-password - Cambiar mi contraseña
router.put('/cambiar-password', usuariosController.cambiarPassword);

// Rutas que requieren permisos de Admin
// GET /api/usuarios - Listar todos los usuarios (Admin/SuperAdmin)
router.get('/', requireAdmin, usuariosController.getUsuarios);

// GET /api/usuarios/:id - Obtener usuario específico (mismo usuario o Admin)
router.get('/:id', requireSelfOrAdmin, usuariosController.getUsuarioById);

// PUT /api/usuarios/:id - Actualizar usuario (mismo usuario o Admin)
router.put('/:id', requireSelfOrAdmin, usuariosController.updateUsuario);

// PUT /api/usuarios/:id/estado - Activar/Desactivar usuario (Admin)
router.put('/:id/estado', requireAdmin, usuariosController.toggleEstado);

// Rutas que requieren permisos de SuperAdmin
// PUT /api/usuarios/:id/rol - Cambiar rol de usuario (SuperAdmin)
router.put('/:id/rol', requireSuperAdmin, usuariosController.cambiarRol);

// DELETE /api/usuarios/:id - Eliminar usuario (SuperAdmin)
router.delete('/:id', requireSuperAdmin, usuariosController.deleteUsuario);

module.exports = router;