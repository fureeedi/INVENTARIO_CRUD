/**
 * Rutas de categorias.
 * - Define los endpoints CRUD para la gestion de categorias
 * - Las categorias son contenedores padres de subcategorias y productos
 * 
 * endpoints:
 * Post /api/categories: crea una nueva categoria
 * Get /api/categories: obtiene todas las categorias
 * Get /api/categories/:id - obtiene una categoria por id
 * Put /api/categories/:id - actualiza una categoria por id
 * Delete /api/categories/:id - elimina una categoria o desactiva
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/authJwt');

// RUTAS CRUD
router.post('/',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    categoryController.createCategory
);

router.get('/', categoryController.getCategories);

router.get('/:id', categoryController.getCategoryById);

router.put('/:id',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    categoryController.updateCategory
);

router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    categoryController.deleteCategory
);

module.exports = router;

