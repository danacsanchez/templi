const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt'); // ← Agregar esta línea
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth.controller');

// Rutas públicas (no requieren autenticación)
router.get('/tipos-usuario', authController.getTiposUsuario);
router.get('/generos', authController.getGeneros);
router.post('/register', authController.register);
router.post('/login', authController.login);

// Agregar esta ruta DESPUÉS de las rutas existentes
router.post('/register', async (req, res) => {
  try {
    const { nombre, fecha_nacimiento, email, contraseña, id_tipo_usuario, id_genero_usuario } = req.body;

    console.log('Datos recibidos para registro:', req.body);

    // Validar que todos los campos estén presentes
    if (!nombre || !fecha_nacimiento || !email || !contraseña || !id_tipo_usuario || !id_genero_usuario) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, fecha_nacimiento, email, contraseña, id_tipo_usuario, id_genero_usuario, fecha_registro) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id_usuario, nombre, email, id_tipo_usuario`,
      [nombre, fecha_nacimiento, email, hashedPassword, id_tipo_usuario, id_genero_usuario]
    );

    const newUser = result.rows[0];
    console.log('Usuario creado exitosamente:', newUser);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id_usuario: newUser.id_usuario,
        nombre: newUser.nombre,
        email: newUser.email,
        tipo_usuario: newUser.id_tipo_usuario
      }
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;