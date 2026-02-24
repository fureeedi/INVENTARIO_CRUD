/**
 * CONTROLADOR DE ESTADISTICAS
 * GET /api/statistics
 * Auth Bearer token requerido
 * 
 * Estadisticas disponibles:
 * 1 - Total de usuarios
 * 2 - Total de productos
 * 3 - Total de categorias
 * 4 - Total de subcategorias
 */

const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Subcategory = require('../models/Subcategory')

/**
 * 
 */

const getStatistics = async (req, res) => {
    try {

        // Ejecuta todas las querys en paralelo
        const [totalUsers, totalProducts, totalCategories, totalSubcategories] = await 
        Promise.all([
            User.countDocuments(), //Contar el total de usuarios
            Product.countDocuments(), //Contar el total de productos
            Category.countDocuments(), //Contar el total de categorias
            Subcategory.countDocuments(), //Contar el total de subcategorias
        ]);

        // Retornar las estadisticas
        res.json({
            totalUsers,
            totalProducts,
            totalCategories,
            totalSubcategories,
        })

    } catch (error) {
        console.error('Error en getStatistics', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las estadisticas',
            message: error.message
        });
    }
}
module.exports = {getStatistics}