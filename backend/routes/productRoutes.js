/**
 * Rutas de productos.
 * - Define los endpoints CRUD para la gestion de productos
 * 
 * endpoints:
 * Post /api/product: crea un nuevo producto
 * Get /api/products: obtiene todos los productos
 * Get /api/product/:id - obtiene un producto por id
 * Put /api/product/:id - actualiza un producto por id
 * Delete /api/product/:id - elimina un producto o desactiva
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { check } = require('express-validator');
const { verifyToken } = require('../middlewares/authJwt');
const checkRole = require('../middlewares/role');

const validateProduct = [
    check('name')
        .not().isEmpty()
        .withMessage('El nombre es obligatorio'),

    check('description')
        .not().isEmpty()
        .withMessage('La descripcion es obligatoria'),

    check('price')
        .not().isEmpty()
        .withMessage('El precio es obligatorio'),
    
    check('stock')
        .not().isEmpty()
        .withMessage('El stock es obligatorio'),

    check('category')
        .not().isEmpty()
        .withMessage('La categoria es obligatoria'),

    check('subcategory')
        .not().isEmpty()
        .withMessage('La subcategoria es obligatoria'),
];

// RUTAS CRUD
router.post('/',
    verifyToken,
    checkRole(['admin', 'coordinador', 'auxiliar']),
    validateProduct,
    productController.createProduct
);

router.get('/', productController.getProducts);

router.get('/:id', productController.getProductById);

router.put('/:id',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    validateProduct,
    productController.updateProduct
);

router.delete('/:id',
    verifyToken,
    checkRole('admin'), // no va validate porque borra toda la información
    productController.deleteProduct
);

module.exports = router;

