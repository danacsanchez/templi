const express = require('express');
const router = express.Router();
const extensionArchivoController = require('../controllers/extensionArchivo.controller');

// GET /api/extensiones - Obtener todas las extensiones
router.get('/', extensionArchivoController.getExtensiones);

// GET /api/extensiones/:id - Obtener extensión por ID
router.get('/:id', extensionArchivoController.getExtensionById);

// POST /api/extensiones - Crear nueva extensión
router.post('/', extensionArchivoController.createExtension);

// PUT /api/extensiones/:id - Actualizar extensión
router.put('/:id', extensionArchivoController.updateExtension);

// DELETE /api/extensiones/:id - Eliminar extensión
router.delete('/:id', extensionArchivoController.deleteExtension);

module.exports = router;