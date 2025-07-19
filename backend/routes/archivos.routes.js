const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/archivos.controller');

// Rutas públicas
// GET /api/archivos - Obtener archivos públicos con filtros
router.get('/', archivosController.getArchivos);

// GET /api/archivos/:id - Obtener archivo específico con imágenes
router.get('/:id', archivosController.getArchivoById);

// Rutas para vendedores (TODO: agregar middleware de autenticación)
// GET /api/archivos/vendedor/mis-archivos - Archivos del vendedor
router.get('/vendedor/mis-archivos', archivosController.getMisArchivos);

// POST /api/archivos - Crear nuevo archivo
router.post('/', archivosController.createArchivo);

// PUT /api/archivos/:id - Actualizar archivo
router.put('/:id', archivosController.updateArchivo);

// PUT /api/archivos/:id/toggle-estado - Activar/Desactivar archivo
router.put('/:id/toggle-estado', archivosController.toggleArchivoEstado);

// POST /api/archivos/:id/descarga - Incrementar contador de descargas
router.post('/:id/descarga', archivosController.incrementarDescargas);

// DELETE /api/archivos/:id - Eliminar archivo
router.delete('/:id', archivosController.deleteArchivo);

module.exports = router;