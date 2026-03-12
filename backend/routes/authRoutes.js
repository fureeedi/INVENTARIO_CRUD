/**
 * Rutas de autenticación
 * - Define los endpoints relativos a autenticación de usuarios
 * POST /api/auth/signup : Login de usuario
 * POST /api/auth/signin : registrar un nuevo usuario 
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifySignUp } = require('../middlewares');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

// RUTAS DE AUTENTICACIÓN

// Requiere email - usuario y password
router.post('/signin', authController.signin);

router.post('/signup',
    verifyToken,
    checkRole('admin'),
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    authController.signup
);

module.exports = router;