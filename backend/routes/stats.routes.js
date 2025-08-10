const express = require('express');
const router = express.Router();
const { getDashboardStats, getVendedorStats } = require('../controllers/stats.controller');

// GET /api/stats/dashboard - Obtener estadísticas del dashboard (sin autenticación)
router.get('/dashboard', getDashboardStats);

// GET /api/stats/vendedor/:vendedorId - Obtener estadísticas específicas del vendedor
router.get('/vendedor/:vendedorId', getVendedorStats);

module.exports = router;