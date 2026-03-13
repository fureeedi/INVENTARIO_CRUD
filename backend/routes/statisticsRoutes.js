/**
 * Rutas de a las estadisticas
 * - Define el endpoint para obtener las estadisticas generales del sistema
 */

const express = require ('express');
const router = express.Router();
const {getStatistics} = require('../controllers/statisticsController')

// get /api/statistics obtiene las estadisticas del sistema
router.get('/', getStatistics);

module.exports = router;