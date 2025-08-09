const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transacciones.controller');

// GET /api/transacciones - Obtener todas las transacciones con filtros
router.get('/', transaccionesController.getTransacciones);

// GET /api/transacciones/estadisticas - Obtener estadísticas
router.get('/estadisticas', transaccionesController.getEstadisticasTransacciones);

// POST /api/transacciones/paypal - Crear transacción PayPal
router.post('/paypal', transaccionesController.createTransaccionPayPal);

// GET /api/transacciones/verificar/:userId/:archivoId - Verificar si usuario compró archivo
router.get('/verificar/:userId/:archivoId', transaccionesController.verificarCompraArchivo);

// GET /api/transacciones/:id - Obtener transacción específica con detalles
router.get('/:id', transaccionesController.getTransaccionById);

// GET /api/transacciones/cliente/:cliente_id - Obtener transacciones de un cliente
router.get('/cliente/:cliente_id', transaccionesController.getTransaccionesCliente);

// PUT /api/transacciones/:id/estado - Actualizar estado de transacción
router.put('/:id/estado', transaccionesController.updateEstadoTransaccion);

module.exports = router;