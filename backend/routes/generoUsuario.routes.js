const express = require('express');
const router = express.Router();
const generoUsuarioController = require('../controllers/generoUsuario.controller');

// GET /api/generos - Obtener todos los géneros
router.get('/', generoUsuarioController.getGeneros);

// GET /api/generos/:id - Obtener género por ID
router.get('/:id', generoUsuarioController.getGeneroById);

// POST /api/generos - Crear nuevo género
router.post('/', generoUsuarioController.createGenero);

// PUT /api/generos/:id - Actualizar género
router.put('/:id', generoUsuarioController.updateGenero);

// DELETE /api/generos/:id - Eliminar género
router.delete('/:id', generoUsuarioController.deleteGenero);

module.exports = router;