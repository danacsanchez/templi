
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const usuariosController = require('../controllers/usuarios.controller');
const { verifyToken } = require('../middleware/auth');

// POST /api/usuarios - Crear usuario (admin)
router.post('/', async (req, res) => {
  try {
    const { nombre, email, fecha_nacimiento, id_genero_usuario, id_tipo_usuario, contraseña } = req.body;
    if (!nombre || !email || !contraseña || !id_tipo_usuario) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    // Validar email único
    const exists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, fecha_nacimiento, id_genero_usuario, id_tipo_usuario, contraseña, fecha_registro)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id_usuario, nombre, email`,
      [nombre, email, fecha_nacimiento || null, id_genero_usuario || null, id_tipo_usuario, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Rutas que requieren autenticación (solo verificar token, sin restricciones de rol)
//router.use(verifyToken);

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