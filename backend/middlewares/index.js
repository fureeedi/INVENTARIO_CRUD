/**
 * Archivo indice de middlewares
 * - Centraliza la importación de todos los middlewares de autenticación y autorización
 * - Permite importar multiples middlewares de forma concisa en las rutas
 */

const authJWT = require('./authJwt');
const verifySignUp = require('./verifySignUp');

// Exportar los middlewares agrupados por modulo

module.exports = {
    authJWT: require('./authJwt'),
    verifySignUp: require('./verifySignUp'),
    role: require('./role')
};