const pool = require('../db');

const getDashboardStats = async (req, res) => {
  try {
    // Query para obtener todas las estadísticas en paralelo
    const [
      usuariosResult,
      vendedoresResult,
      compradoresResult,
      archivosResult,
      archivosActivosResult,
      archivosInactivosResult,
      transaccionesResult,
      ingresosTotalesResult,
      descargasResult,
      archivoMasDescargadoResult,
      categoriasResult,
      categoriaMasUsadaResult,
      topCategoriasResult,
      metodosPagoResult,
      metodoMasUsadoResult
    ] = await Promise.all([
      // Total de usuarios
      pool.query('SELECT COUNT(*) as total FROM usuarios'),
      
      // Total de vendedores (desde tabla vendedor)
      pool.query('SELECT COUNT(*) as total FROM vendedor'),
      
      // Total de compradores/clientes (desde tabla cliente)
      pool.query('SELECT COUNT(*) as total FROM cliente'),
      
      // Total de archivos
      pool.query('SELECT COUNT(*) as total FROM archivos'),
      
      // Archivos activos
      pool.query('SELECT COUNT(*) as total FROM archivos WHERE activo = true'),
      
      // Archivos inactivos
      pool.query('SELECT COUNT(*) as total FROM archivos WHERE activo = false'),
      
      // Total de transacciones
      pool.query('SELECT COUNT(*) as total FROM transacciones'),
      
      // Ingresos totales
      pool.query('SELECT COALESCE(SUM(total_pago), 0) as total FROM transacciones'),
      
      // Total de descargas (suma de num_descargas de todos los archivos)
      pool.query('SELECT COALESCE(SUM(num_descargas), 0) as total FROM archivos'),
      
      // Archivo más descargado
      pool.query(`
        SELECT nombre_archivo, num_descargas 
        FROM archivos 
        WHERE num_descargas > 0 
        ORDER BY num_descargas DESC 
        LIMIT 1
      `),
      
      // Total de categorías
      pool.query('SELECT COUNT(*) as total FROM categoria_archivo'),
      
      // Categoría más usada
      pool.query(`
        SELECT ca.nombre, COUNT(a.id_archivo) as total_archivos
        FROM categoria_archivo ca
        LEFT JOIN archivos a ON ca.id_categoria_archivo = a.id_categoria_archivo
        GROUP BY ca.id_categoria_archivo, ca.nombre
        ORDER BY total_archivos DESC
        LIMIT 1
      `),
      
      // Top 5 categorías para gráfico de pastel
      pool.query(`
        SELECT ca.nombre, COUNT(a.id_archivo) as total_archivos
        FROM categoria_archivo ca
        LEFT JOIN archivos a ON ca.id_categoria_archivo = a.id_categoria_archivo
        GROUP BY ca.id_categoria_archivo, ca.nombre
        HAVING COUNT(a.id_archivo) > 0
        ORDER BY total_archivos DESC
        LIMIT 5
      `),
      
      // Total de métodos de pago
      pool.query('SELECT COUNT(*) as total FROM metodos_pago'),
      
      // Método de pago más usado
      pool.query(`
        SELECT mp.nombre, COUNT(t.id_transacciones) as total_transacciones
        FROM metodos_pago mp
        LEFT JOIN transacciones t ON mp.id_metodos_pago = t.id_metodos_pago
        GROUP BY mp.id_metodos_pago, mp.nombre
        ORDER BY total_transacciones DESC
        LIMIT 1
      `)
    ]);

    // Construir el objeto de estadísticas
    const stats = {
      totalUsuarios: parseInt(usuariosResult.rows[0].total),
      totalVendedores: parseInt(vendedoresResult.rows[0].total),
      totalCompradores: parseInt(compradoresResult.rows[0].total),
      totalArchivos: parseInt(archivosResult.rows[0].total),
      archivosActivos: parseInt(archivosActivosResult.rows[0].total),
      archivosInactivos: parseInt(archivosInactivosResult.rows[0].total),
      totalTransacciones: parseInt(transaccionesResult.rows[0].total),
      ingresosTotales: parseFloat(ingresosTotalesResult.rows[0].total),
      totalDescargas: parseInt(descargasResult.rows[0].total),
      archivoMasDescargado: archivoMasDescargadoResult.rows.length > 0 
        ? {
            nombre: archivoMasDescargadoResult.rows[0].nombre_archivo,
            descargas: parseInt(archivoMasDescargadoResult.rows[0].num_descargas)
          }
        : { nombre: 'N/A', descargas: 0 },
      totalCategorias: parseInt(categoriasResult.rows[0].total),
      categoriaMasUsada: categoriaMasUsadaResult.rows.length > 0
        ? {
            nombre: categoriaMasUsadaResult.rows[0].nombre,
            archivos: parseInt(categoriaMasUsadaResult.rows[0].total_archivos)
          }
        : { nombre: 'N/A', archivos: 0 },
      topCategorias: topCategoriasResult.rows.map(row => ({
        nombre: row.nombre,
        archivos: parseInt(row.total_archivos)
      })),
      totalMetodosPago: parseInt(metodosPagoResult.rows[0].total),
      metodoMasUsado: metodoMasUsadoResult.rows.length > 0
        ? {
            nombre: metodoMasUsadoResult.rows[0].nombre,
            transacciones: parseInt(metodoMasUsadoResult.rows[0].total_transacciones)
          }
        : { nombre: 'N/A', transacciones: 0 }
    };

    console.log('Estadísticas del dashboard obtenidas:', stats);
    res.json(stats);

  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener estadísticas',
      details: error.message 
    });
  }
};

// Obtener estadísticas específicas del vendedor
const getVendedorStats = async (req, res) => {
  try {
    const { vendedorId } = req.params;

    // Consulta de depuración para ver los valores de activo
    const debugResult = await pool.query(`
      SELECT activo, COUNT(*) as count 
      FROM archivos 
      WHERE id_vendedor = $1 
      GROUP BY activo
    `, [vendedorId]);
    console.log(`Debug - Valores de activo para vendedor ${vendedorId}:`, debugResult.rows);

    const [
      // Contar archivos del vendedor
      archivosResult,
      // Contar archivos activos del vendedor
      archivosActivosResult,
      // Contar archivos inactivos del vendedor
      archivosInactivosResult,
      // Sumar ingresos del vendedor (total de transacciones)
      ingresosResult,
      // Contar transacciones del vendedor
      transaccionesResult,
      // Sumar descargas de archivos del vendedor
      descargasResult,
      // Top 3 categorías más usadas por el vendedor
      topCategoriasResult
    ] = await Promise.all([
      // Archivos del vendedor
      pool.query(`
        SELECT COUNT(*) as total 
        FROM archivos 
        WHERE id_vendedor = $1
      `, [vendedorId]),

      // Archivos activos del vendedor (considerando NULL como activo por defecto)
      pool.query(`
        SELECT COUNT(*) as total 
        FROM archivos 
        WHERE id_vendedor = $1 AND (activo = true OR activo IS NULL)
      `, [vendedorId]),

      // Archivos inactivos del vendedor
      pool.query(`
        SELECT COUNT(*) as total 
        FROM archivos 
        WHERE id_vendedor = $1 AND activo = false
      `, [vendedorId]),

      // Ingresos del vendedor
      pool.query(`
        SELECT COALESCE(SUM(t.total_pago), 0) as total
        FROM transacciones t
        JOIN detalle_transaccion dt ON t.id_transacciones = dt.id_transacciones
        JOIN archivos a ON dt.id_archivo = a.id_archivo
        JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
        WHERE a.id_vendedor = $1 AND et.estado = 'Completada'
      `, [vendedorId]),

      // Transacciones del vendedor
      pool.query(`
        SELECT COUNT(DISTINCT t.id_transacciones) as total
        FROM transacciones t
        JOIN detalle_transaccion dt ON t.id_transacciones = dt.id_transacciones
        JOIN archivos a ON dt.id_archivo = a.id_archivo
        JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
        WHERE a.id_vendedor = $1 AND et.estado = 'Completada'
      `, [vendedorId]),

      // Descargas de archivos del vendedor
      pool.query(`
        SELECT COALESCE(SUM(num_descargas), 0) as total
        FROM archivos
        WHERE id_vendedor = $1
      `, [vendedorId]),

      // Top 3 categorías del vendedor
      pool.query(`
        SELECT ca.nombre as categoria, COUNT(a.id_archivo) as total_archivos
        FROM archivos a
        JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
        WHERE a.id_vendedor = $1
        GROUP BY ca.id_categoria_archivo, ca.nombre
        ORDER BY total_archivos DESC
        LIMIT 3
      `, [vendedorId])
    ]);

    const stats = {
      totalArchivos: parseInt(archivosResult.rows[0].total),
      archivosActivos: parseInt(archivosActivosResult.rows[0].total),
      archivosInactivos: parseInt(archivosInactivosResult.rows[0].total),
      totalIngresos: parseFloat(ingresosResult.rows[0].total),
      totalTransacciones: parseInt(transaccionesResult.rows[0].total),
      totalDescargas: parseInt(descargasResult.rows[0].total),
      topCategorias: topCategoriasResult.rows.map(row => ({
        categoria: row.categoria,
        archivos: parseInt(row.total_archivos)
      }))
    };

    console.log('Estadísticas del vendedor obtenidas:', stats);
    res.json(stats);

  } catch (error) {
    console.error('Error obteniendo estadísticas del vendedor:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener estadísticas del vendedor',
      details: error.message 
    });
  }
};

module.exports = {
  getDashboardStats,
  getVendedorStats
};