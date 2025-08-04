const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');

// Obtener tipos de usuario (para el formulario)
exports.getTiposUsuario = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tipo_usuarios ORDER BY id_tipo_usuario');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tipos de usuario:', error);
    res.status(500).json({ error: 'Error al obtener tipos de usuario' });
  }
};

// Obtener géneros (para el formulario)
exports.getGeneros = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM genero_usuario ORDER BY id_genero_usuario');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener géneros:', error);
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
};

// Registrar usuario
exports.register = async (req, res) => {
  console.log('Datos de registro recibidos:', req.body);
  
  try {
    const { 
      id_tipo_usuario, 
      id_genero_usuario, 
      nombre, 
      fecha_nacimiento, 
      email, 
      contraseña 
    } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !contraseña || !id_tipo_usuario || !id_genero_usuario) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el email ya existe
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1', 
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Transacción para crear usuario y registro en tabla específica
    await pool.query('BEGIN');

    try {
      // Crear usuario principal
      const userResult = await pool.query(
        'INSERT INTO usuarios (id_tipo_usuario, id_genero_usuario, nombre, fecha_nacimiento, email, contraseña) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [id_tipo_usuario, id_genero_usuario, nombre, fecha_nacimiento, email, hashedPassword]
      );

      const newUser = userResult.rows[0];

      // Crear registro en tabla específica según el tipo
      if (id_tipo_usuario == 1) { // Cliente
        await pool.query(
          'INSERT INTO cliente (id_usuario) VALUES ($1)',
          [newUser.id_usuario]
        );
        console.log('Cliente creado');
      } else if (id_tipo_usuario == 2) { // Vendedor
        await pool.query(
          'INSERT INTO vendedor (id_usuario) VALUES ($1)',
          [newUser.id_usuario]
        );
        console.log('Vendedor creado');
      }
      // SuperAdmin (3) no necesita tabla adicional

      await pool.query('COMMIT');

      // Obtener usuario completo con información del tipo
      const userWithType = await pool.query(
        `SELECT u.*, tu.nombre as rol, g.nombre as genero
         FROM usuarios u 
         JOIN tipo_usuarios tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
         JOIN genero_usuario g ON u.id_genero_usuario = g.id_genero_usuario
         WHERE u.id_usuario = $1`,
        [newUser.id_usuario]
      );

      const user = userWithType.rows[0];
      delete user.contraseña;


      // Enviar correo de bienvenida
      try {
        await sendMail(user.email);
        console.log('Correo de bienvenida enviado a', user.email);
      } catch (mailError) {
        console.error('Error al enviar correo de bienvenida:', mailError);
      }

      console.log('Usuario registrado exitosamente:', user.nombre);
      res.status(201).json({ 
        message: 'Usuario registrado exitosamente',
        user: user
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  console.log('Intento de login:', req.body.email);
  
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario con información completa
    const result = await pool.query(
      `SELECT u.*, tu.nombre as rol, g.nombre as genero
       FROM usuarios u 
       JOIN tipo_usuarios tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
       JOIN genero_usuario g ON u.id_genero_usuario = g.id_genero_usuario
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    delete user.contraseña;

    // Crear JWT
    const token = jwt.sign(
      { 
        userId: user.id_usuario, 
        rol: user.rol,
        tipoUsuario: user.id_tipo_usuario
      },
      process.env.JWT_SECRET || 'secreto_temporal',
      { expiresIn: '24h' }
    );

    console.log('Login exitoso:', user.nombre, '-', user.rol);
    res.json({ 
      message: 'Login exitoso',
      user: user,
      token: token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
  }
};