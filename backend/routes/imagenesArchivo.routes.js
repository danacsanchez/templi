const express = require('express');
const router = express.Router();
const imagenesArchivoController = require('../controllers/imagenesArchivo.controller');

// GET /api/imagenes-archivo - Obtener todas las imágenes
router.get('/', imagenesArchivoController.getAllImagenes);

// GET /api/imagenes-archivo/archivo/:archivo_id - Obtener todas las imágenes de un archivo
router.get('/archivo/:archivo_id', imagenesArchivoController.getImagenesArchivo);

// GET /api/imagenes-archivo/archivo/:archivo_id/portada - Obtener portada de un archivo
router.get('/archivo/:archivo_id/portada', imagenesArchivoController.getPortadaArchivo);

// GET /api/imagenes-archivo/:id - Obtener imagen específica
router.get('/:id', imagenesArchivoController.getImagenById);

// POST /api/imagenes-archivo/archivo/:archivo_id - Crear nueva imagen para un archivo
router.post('/archivo/:archivo_id', imagenesArchivoController.createImagen);

// PUT /api/imagenes-archivo/:id - Actualizar imagen
router.put('/:id', imagenesArchivoController.updateImagen);

// PUT /api/imagenes-archivo/:id/portada - Marcar imagen como portada
router.put('/:id/portada', imagenesArchivoController.setPortada);

// PUT /api/imagenes-archivo/archivo/:archivo_id/reordenar - Reordenar imágenes
router.put('/archivo/:archivo_id/reordenar', imagenesArchivoController.reordenarImagenes);

// DELETE /api/imagenes-archivo/:id - Eliminar imagen
router.delete('/:id', imagenesArchivoController.deleteImagen);

module.exports = router;