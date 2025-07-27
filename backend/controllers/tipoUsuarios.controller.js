const pool = require('../db');

// Obtener todos los tipos de usuario
exports.getTiposUsuario = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_tipo_usuario, nombre FROM tipo_usuarios ORDER BY id_tipo_usuario'
    );
    
    console.log(`Tipos de usuario obtenidos: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tipos de usuario:', error);
    res.status(500).json({ error: 'Error al obtener tipos de usuario' });
  }
};

// Obtener un tipo de usuario por ID
exports.getTipoUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id_tipo_usuario, nombre FROM tipo_usuarios WHERE id_tipo_usuario = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de usuario no encontrado' });
    }

    console.log(`Tipo de usuario encontrado: ${result.rows[0].nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener tipo de usuario:', error);
    res.status(500).json({ error: 'Error al obtener tipo de usuario' });
  }
};
