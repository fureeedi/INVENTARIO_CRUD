/**
 * MIDDLEWARE: Autenticación JWT
 * 
 * - Verifica que si el usuario tenga un token valido y carga los datos del usuario en req.user
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Autenticar usuario
 * - Valida el token Bearer en el header Authorization
 * - Si es valido carga el usuario en req.user
 * - Si no es valido o no existe retorna 401 Unauthorized
 */

exports.authenticate = async (req, res, next) => {
    try {

        // Extraer el token del header Bearer <token>
        const token = req.header('Authorization')?.
        replace('Bearer', '');

        // Si no hay token rexhaza la solicitud
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido',
                details: 'Incluye Autorization: Bearer <token>'
            });
        }
        
    } catch (error){

    }
};