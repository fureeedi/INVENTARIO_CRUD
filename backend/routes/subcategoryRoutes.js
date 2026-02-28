/**
 * Rutas de subcategorias.
 * - Define los endpoints CRUD para la gestion de subcategorias
 * - Las subcategorias son contenedores padres de productos
 * 
 * endpoints:
 * Post /api/subcategories: crea una nueva subcategoria
 * Get /api/subcategories: obtiene todas las subcategorias
 * Get /api/subcategories/:id - obtiene una subcategoria por id
 * Put /api/subcategories/:id - actualiza una subcategoria por id
 * Delete /api/subcategories/:id - elimina una subcategoria o desactiva
 */

const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const { check } = require('express-validator');
const { verifyToken } = require('../middlewares/authJwt');
const checkRole = require('../middlewares/role');

const validateSubcategory = [
    check('name')
        .not().isEmpty()
        .withMessage('El nombre es obligatorio'),

    check('description')
        .not().isEmpty()
        .withMessage('La descripcion es obligatoria'),
    
    check('category')
        .not().isEmpty()
        .withMessage('La categoria es obligatoria'),
];

// RUTAS CRUD
router.post('/',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    validateSubcategory,
    subcategoryController.createSubcategory
);

router.get('/', subcategoryController.getSubcategories);

router.get('/:id', subcategoryController.getSubcategoryById);

router.put('/:id',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    validateSubcategory,
    subcategoryController.updateSubcategory
);

router.delete('/:id',
    verifyToken,
    checkRole('admin'), // no va validate porque borra toda la información
    subcategoryController.deleteSubcategory
);

module.exports = router;

