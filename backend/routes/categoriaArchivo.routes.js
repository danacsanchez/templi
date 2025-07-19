const express = require('express');
const router = express.Router();
const categoriaArchivoController = require('../controllers/categoriaArchivo.controller');

// GET /api/categorias - Obtener todas las categorías
router.get('/', categoriaArchivoController.getCategorias);

// GET /api/categorias/:id - Obtener categoría por ID
router.get('/:id', categoriaArchivoController.getCategoriaById);

// POST /api/categorias - Crear nueva categoría
router.post('/', categoriaArchivoController.createCategoria);

// PUT /api/categorias/:id - Actualizar categoría
router.put('/:id', categoriaArchivoController.updateCategoria);

// DELETE /api/categorias/:id - Eliminar categoría
router.delete('/:id', categoriaArchivoController.deleteCategoria);

module.exports = router;