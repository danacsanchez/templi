require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes y archivos subidos)
app.use('/uploads', express.static('uploads'));

// Rutas existentes
const archivosRoutes = require('./routes/archivos.routes');
app.use('/api/archivos', archivosRoutes);

// Rutas de autenticación
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Rutas de métodos de pago
const metodosPagoRoutes = require('./routes/metodosPago.routes');
app.use('/api/metodos-pago', metodosPagoRoutes);

// Rutas de extensiones de archivo
const extensionArchivoRoutes = require('./routes/extensionArchivo.routes');
app.use('/api/extensiones', extensionArchivoRoutes);

// Rutas de categorías de archivo
const categoriaArchivoRoutes = require('./routes/categoriaArchivo.routes');
app.use('/api/categorias', categoriaArchivoRoutes);

// Rutas de géneros de usuario
const generoUsuarioRoutes = require('./routes/generoUsuario.routes');
app.use('/api/generos', generoUsuarioRoutes);

// Rutas de imágenes de archivo
const imagenesArchivoRoutes = require('./routes/imagenesArchivo.routes');
app.use('/api/imagenes', imagenesArchivoRoutes);

const transaccionesRoutes = require('./routes/transacciones.routes');
app.use('/api/transacciones', transaccionesRoutes);

const detalleTransaccionesRoutes = require('./routes/detalleTransacciones.routes');
app.use('/api/detalle-transacciones', detalleTransaccionesRoutes);

// Rutas de tipos de usuario (catálogo)
const tipoUsuariosRoutes = require('./routes/tipoUsuarios.routes');
app.use('/api/tipo-usuarios', tipoUsuariosRoutes);

// Rutas de usuarios
const usuariosRoutes = require('./routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log('* Rutas de autenticación disponibles:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login'); 
  console.log('   GET  /api/auth/tipos-usuario');
  console.log('   GET  /api/auth/generos');
  console.log('* Rutas de métodos de pago disponibles:');
  console.log('   GET    /api/metodos-pago');
  console.log('   GET    /api/metodos-pago/:id');
  console.log('   POST   /api/metodos-pago');
  console.log('   PUT    /api/metodos-pago/:id');
  console.log('   DELETE /api/metodos-pago/:id');
  console.log('* Rutas de extensiones disponibles:');
  console.log('   GET    /api/extensiones');
  console.log('   GET    /api/extensiones/:id');
  console.log('   POST   /api/extensiones');
  console.log('   PUT    /api/extensiones/:id');
  console.log('   DELETE /api/extensiones/:id');
  console.log('* Rutas de categorías disponibles:');
  console.log('   GET    /api/categorias');
  console.log('   GET    /api/categorias/:id');
  console.log('   POST   /api/categorias');
  console.log('   PUT    /api/categorias/:id');
  console.log('   DELETE /api/categorias/:id');
  console.log('* Rutas de géneros disponibles:');
  console.log('   GET    /api/generos');
  console.log('   GET    /api/generos/:id');
  console.log('   POST   /api/generos');
  console.log('   PUT    /api/generos/:id');
  console.log('   DELETE /api/generos/:id');
  console.log('* Rutas de tipos de usuario disponibles:'); // 🆕 NUEVO
  console.log('   GET    /api/tipo-usuarios');               // 🆕 NUEVO
  console.log('   GET    /api/tipo-usuarios/:id');           // 🆕 NUEVO
  console.log('* Rutas de archivos disponibles:');
  console.log('   GET    /api/archivos');
  console.log('   GET    /api/archivos/:id');
  console.log('   GET    /api/archivos/vendedor/mis-archivos');
  console.log('   POST   /api/archivos');
  console.log('   PUT    /api/archivos/:id');
  console.log('   PUT    /api/archivos/:id/toggle-estado');
  console.log('   POST   /api/archivos/:id/descarga');
  console.log('   DELETE /api/archivos/:id');
  console.log('* Rutas de imágenes disponibles:');
  console.log('   GET    /api/imagenes/archivo/:archivo_id');
  console.log('   GET    /api/imagenes/archivo/:archivo_id/portada');
  console.log('   GET    /api/imagenes/:id');
  console.log('   POST   /api/imagenes/archivo/:archivo_id');
  console.log('   PUT    /api/imagenes/:id');
  console.log('   PUT    /api/imagenes/:id/portada');
  console.log('   PUT    /api/imagenes/archivo/:archivo_id/reordenar');
  console.log('   DELETE /api/imagenes/:id');
  console.log('* Rutas de transacciones disponibles:');
  console.log('   GET    /api/transacciones');
  console.log('   GET    /api/transacciones/estadisticas');
  console.log('   GET    /api/transacciones/:id');
  console.log('   GET    /api/transacciones/cliente/:cliente_id');
  console.log('   PUT    /api/transacciones/:id/estado');
  console.log('* Rutas de detalle transacciones disponibles:');
  console.log('   GET    /api/detalle-transacciones/transaccion/:transaccion_id');
  console.log('   GET    /api/detalle-transacciones/:id');
  console.log('   GET    /api/detalle-transacciones/cliente/:cliente_id/archivos');
  console.log('   GET    /api/detalle-transacciones/vendedor/:vendedor_id/ventas');
  console.log('   GET    /api/detalle-transacciones/reportes/mas-vendidos');
  console.log('* Rutas de usuarios disponibles:');
  console.log('   GET    /api/usuarios (requiere Admin)');
  console.log('   GET    /api/usuarios/perfil (requiere token)');
  console.log('   GET    /api/usuarios/:id (requiere token + permisos)');
  console.log('   PUT    /api/usuarios/perfil (requiere token)');
  console.log('   PUT    /api/usuarios/cambiar-password (requiere token)');
  console.log('   PUT    /api/usuarios/:id (requiere token + permisos)');
  console.log('   PUT    /api/usuarios/:id/rol (requiere SuperAdmin)');
  console.log('   PUT    /api/usuarios/:id/estado (requiere Admin)');
  console.log('   DELETE /api/usuarios/:id (requiere SuperAdmin)');
});
