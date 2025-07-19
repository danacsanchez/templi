const jwt = require('jsonwebtoken');
const pool = require('../db');

// Verificar token JWT
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe y está activo
    const user = await pool.query(
      'SELECT u.*, tu.tipo FROM usuarios u JOIN tipo_usuarios tu ON u.id_tipo_usuarios = tu.id_tipo_usuarios WHERE u.id_usuario = $1 AND u.activo = true',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Token inválido o usuario inactivo' });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Verificar si es Admin o SuperAdmin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (req.user.tipo !== 'Admin' && req.user.tipo !== 'SuperAdmin') {
    return res.status(403).json({ error: 'Permisos insuficientes. Se requiere rol de Admin o SuperAdmin' });
  }

  next();
};

// Verificar si es SuperAdmin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (req.user.tipo !== 'SuperAdmin') {
    return res.status(403).json({ error: 'Permisos insuficientes. Se requiere rol de SuperAdmin' });
  }

  next();
};

// Verificar si es el mismo usuario o Admin
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const userId = parseInt(req.params.id);
  const isOwnProfile = req.user.id_usuario === userId;
  const isAdmin = req.user.tipo === 'Admin' || req.user.tipo === 'SuperAdmin';

  if (!isOwnProfile && !isAdmin) {
    return res.status(403).json({ error: 'Solo puedes acceder a tu propio perfil o ser Admin' });
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireSuperAdmin,
  requireSelfOrAdmin
};