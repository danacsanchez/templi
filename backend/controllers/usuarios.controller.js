const pool = require('../db');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios (Admin/SuperAdmin)
exports.getUsuarios = async (req, res) => {
  try {
    const { 
      tipo, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = `
      SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.fecha_nacimiento,
        u.fecha_registro,
        tu.nombre as rol,
        gu.nombre as genero
      FROM usuarios u
      JOIN tipo_usuarios tu ON u.id_tipo_usuario = tu.id_tipo_usuario
      LEFT JOIN genero_usuario gu ON u.id_genero_usuario = gu.id_genero_usuario
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    // Filtros opcionales
    if (tipo) {
      query += ` AND u.id_tipo_usuario = $${paramCount}`;
      params.push(tipo);
      paramCount++;
    }

    if (search) {
      query += ` AND (LOWER(u.nombre) LIKE LOWER($${paramCount}) OR LOWER(u.email) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Paginación
    const offset = (page - 1) * limit;
    query += ` ORDER BY u.fecha_registro DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener total para paginación
    let countQuery = `
      SELECT COUNT(*) as total
      FROM usuarios u
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 1;

    if (tipo) {
      countQuery += ` AND u.id_tipo_usuario = $${countParamCount}`;
      countParams.push(tipo);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (LOWER(u.nombre) LIKE LOWER($${countParamCount}) OR LOWER(u.email) LIKE LOWER($${countParamCount}))`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    console.log(`Usuarios obtenidos: ${result.rows.length} de ${total} total`);
    
    res.json({
      usuarios: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener perfil del usuario autenticado
exports.getPerfil = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    
    const result = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.fecha_nacimiento,
        u.fecha_registro,
        tu.nombre as rol,
        gu.nombre as genero
      FROM usuarios u
      JOIN tipo_usuarios tu ON u.id_tipo_usuario = tu.id_tipo_usuario
      LEFT JOIN genero_usuario gu ON u.id_genero_usuario = gu.id_genero_usuario
      WHERE u.id_usuario = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log(`Perfil obtenido para usuario: ${result.rows[0].email}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Obtener usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.fecha_nacimiento,
        u.fecha_registro,
        tu.nombre as rol,
        gu.nombre as genero
      FROM usuarios u
      JOIN tipo_usuarios tu ON u.id_tipo_usuario = tu.id_tipo_usuario
      LEFT JOIN genero_usuario gu ON u.id_genero_usuario = gu.id_genero_usuario
      WHERE u.id_usuario = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log(`Usuario encontrado: ${result.rows[0].email}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Actualizar perfil del usuario
exports.updatePerfil = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const {
      nombre,
      fecha_nacimiento,
      id_genero_usuario
    } = req.body;

    // Validaciones básicas
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // Construir query dinámico
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (nombre) {
      updateFields.push(`nombre = $${paramCount}`);
      values.push(nombre.trim());
      paramCount++;
    }

    if (fecha_nacimiento) {
      updateFields.push(`fecha_nacimiento = $${paramCount}`);
      values.push(fecha_nacimiento);
      paramCount++;
    }

    if (id_genero_usuario) {
      // Verificar que existe el género
      const generoExists = await pool.query(
        'SELECT * FROM genero_usuario WHERE id_genero_usuario = $1',
        [id_genero_usuario]
      );

      if (generoExists.rows.length === 0) {
        return res.status(400).json({ error: 'Género no válido' });
      }

      updateFields.push(`id_genero_usuario = $${paramCount}`);
      values.push(id_genero_usuario);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(userId);

    const result = await pool.query(`
      UPDATE usuarios 
      SET ${updateFields.join(', ')}
      WHERE id_usuario = $${paramCount}
      RETURNING id_usuario, nombre, email, fecha_nacimiento
    `, values);

    const updatedUser = result.rows[0];
    console.log(`Perfil actualizado para usuario: ${updatedUser.email}`);
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      usuario: updatedUser
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// Actualizar usuario (Admin)
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      fecha_nacimiento,
      id_genero_usuario
    } = req.body;

    // Verificar que existe el usuario
    const exists = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Construir query dinámico
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (nombre) {
      updateFields.push(`nombre = $${paramCount}`);
      values.push(nombre.trim());
      paramCount++;
    }

    if (fecha_nacimiento) {
      updateFields.push(`fecha_nacimiento = $${paramCount}`);
      values.push(fecha_nacimiento);
      paramCount++;
    }

    if (id_genero_usuario) {
      const generoExists = await pool.query(
        'SELECT * FROM genero_usuario WHERE id_genero_usuario = $1',
        [id_genero_usuario]
      );

      if (generoExists.rows.length === 0) {
        return res.status(400).json({ error: 'Género no válido' });
      }

      updateFields.push(`id_genero_usuario = $${paramCount}`);
      values.push(id_genero_usuario);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);

    const result = await pool.query(`
      UPDATE usuarios 
      SET ${updateFields.join(', ')}
      WHERE id_usuario = $${paramCount}
      RETURNING id_usuario, nombre, email, fecha_nacimiento
    `, values);

    const updatedUser = result.rows[0];
    console.log(`Usuario actualizado por admin: ${updatedUser.email}`);
    
    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: updatedUser
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Cambiar rol de usuario (SuperAdmin)
exports.cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_tipo_usuario } = req.body;

    if (!id_tipo_usuario) {
      return res.status(400).json({ error: 'Tipo de usuario requerido' });
    }

    // Verificar que existe el usuario
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = $1',
      [id]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que existe el tipo de usuario
    const tipoExists = await pool.query(
      'SELECT * FROM tipo_usuarios WHERE id_tipo_usuario = $1',
      [id_tipo_usuario]
    );

    if (tipoExists.rows.length === 0) {
      return res.status(400).json({ error: 'Tipo de usuario no válido' });
    }

    await pool.query('BEGIN');

    try {
      // Actualizar rol
      await pool.query(
        'UPDATE usuarios SET id_tipo_usuario = $1 WHERE id_usuario = $2',
        [id_tipo_usuario, id]
      );

      // Crear registros en tablas relacionadas según el nuevo rol
      const tipoUsuario = tipoExists.rows[0].nombre;

      if (tipoUsuario === 'Vendedor') {
        // Verificar si ya existe en tabla vendedor
        const vendedorExists = await pool.query(
          'SELECT * FROM vendedor WHERE id_usuario = $1',
          [id]
        );

        if (vendedorExists.rows.length === 0) {
          await pool.query(
            'INSERT INTO vendedor (id_usuario) VALUES ($1)',
            [id]
          );
        }
      } else if (tipoUsuario === 'Cliente') {
        // Verificar si ya existe en tabla cliente
        const clienteExists = await pool.query(
          'SELECT * FROM cliente WHERE id_usuario = $1',
          [id]
        );

        if (clienteExists.rows.length === 0) {
          await pool.query(
            'INSERT INTO cliente (id_usuario) VALUES ($1)',
            [id]
          );
        }
      }

      await pool.query('COMMIT');

      console.log(`Rol cambiado para usuario ${id} a ${tipoUsuario}`);
      
      res.json({
        message: `Rol cambiado exitosamente a ${tipoUsuario}`,
        nuevo_rol: tipoUsuario
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ error: 'Error al cambiar rol' });
  }
};

// Cambiar contraseña
exports.cambiarPassword = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (password_nueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Obtener contraseña actual
    const user = await pool.query(
      'SELECT contraseña FROM usuarios WHERE id_usuario = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const passwordMatch = await bcrypt.compare(password_actual, user.rows[0].contraseña);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password_nueva, saltRounds);

    // Actualizar contraseña
    await pool.query(
      'UPDATE usuarios SET contraseña = $1 WHERE id_usuario = $2',
      [hashedPassword, userId]
    );

    console.log(`Contraseña cambiada para usuario ${userId}`);
    
    res.json({
      message: 'Contraseña cambiada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

// Eliminar usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const exists = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = exists.rows[0];

    // Verificar si tiene transacciones o archivos
    const hasTransactions = await pool.query(`
      SELECT COUNT(*) as count FROM (
        SELECT t.id_transacciones FROM transacciones t
        JOIN cliente c ON t.id_cliente = c.id_cliente
        WHERE c.id_usuario = $1
        UNION
        SELECT dt.id_transacciones FROM detalle_transaccion dt
        JOIN archivos a ON dt.id_archivo = a.id_archivo
        JOIN vendedor v ON a.id_vendedor = v.id_vendedor
        WHERE v.id_usuario = $1
      ) combined
    `, [id]);

    if (parseInt(hasTransactions.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar. Este usuario tiene transacciones asociadas' 
      });
    }

    // Eliminar usuario
    const deleted = await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario, nombre, email',
      [id]
    );

    console.log(`Usuario eliminado: ${deleted.rows[0].email}`);
    
    res.json({
      message: 'Usuario eliminado exitosamente',
      usuario: deleted.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};