const express = require('express');
const router = express.Router();
const metodosPagoController = require('../controllers/metodosPago.controller');

// Rutas públicas (por ahora sin autenticación para testing)
// GET /api/metodos-pago - Obtener todos los métodos de pago
router.get('/', metodosPagoController.getMetodosPago);

// GET /api/metodos-pago/:id - Obtener método de pago por ID
router.get('/:id', metodosPagoController.getMetodoPagoById);

// POST /api/metodos-pago - Crear nuevo método de pago
router.post('/', metodosPagoController.createMetodoPago);

// PUT /api/metodos-pago/:id - Actualizar método de pago
router.put('/:id', metodosPagoController.updateMetodoPago);

// DELETE /api/metodos-pago/:id - Eliminar método de pago
router.delete('/:id', metodosPagoController.deleteMetodoPago);

module.exports = router;