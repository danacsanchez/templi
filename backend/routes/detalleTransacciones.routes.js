const express = require('express');
const router = express.Router();
const detalleTransaccionesController = require('../controllers/detalleTransacciones.controller');

// GET /api/detalle-transacciones/transaccion/:transaccion_id - Obtener detalles de una transacción
router.get('/transaccion/:transaccion_id', detalleTransaccionesController.getDetallesTransaccion);

// GET /api/detalle-transacciones/:id - Obtener detalle específico
router.get('/:id', detalleTransaccionesController.getDetalleById);

// GET /api/detalle-transacciones/cliente/:cliente_id/archivos - Archivos comprados por cliente
router.get('/cliente/:cliente_id/archivos', detalleTransaccionesController.getArchivosCompradosCliente);

// GET /api/detalle-transacciones/vendedor/:vendedor_id/ventas - Ventas de un vendedor
router.get('/vendedor/:vendedor_id/ventas', detalleTransaccionesController.getVentasVendedor);

// GET /api/detalle-transacciones/reportes/mas-vendidos - Archivos más vendidos
router.get('/reportes/mas-vendidos', detalleTransaccionesController.getArchivosMasVendidos);

module.exports = router;