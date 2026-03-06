/**
 * MIDDLEWARE: Autenticación JWT
 * 
 * - Verifica que si el usuario tenga un token valido y carga los datos del usuario en req.user
 */

// codificar y decodificar el token
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
        replace('Bearer', ''); // que el token sea limpio sin prefijos

        // Si no hay token rexhaza la solicitud - Que el usuario deba existir en el sistema
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido',
                details: 'Incluye Autorization: Bearer <token>'
            });
        }

        // Verificar y decodificr el token
        const decoded = jwt.verify(token, process.env.JWR_SECRET);

        // Buscar el usuario en la base de datos - Usuario que entre al sistema y genere token
        const user = await User.findById(decoded.id);

        // Si no existe el usuario
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'El usuario no existe o eliminado'
            });
        }

        // Guardar el usuario en el request para usar en los siguientes middlewares o controladores
        req.user = user;

        // Llamar el siguente middleware o controller
        next();

    } catch (error){

        // Token invalido o error en la verificación
        let message = 'Token invalido o expirado';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expirado, por favor inicia sesion nuevamente';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Token invalido o mal formado';            
        }

        // fallo token
        return res.status(401).json({
            success: false,
            message: message,
            error: error.message
        });
    }
};

 /**
  * MIDDLEWARE para autorizar por role
  * - Verifica que el usuario tiene uno de los roles requiridos se usa despues del middleware autheticate
  * @param {Array} roles - Array de roles permitidos
  * @returns {Function} - Middleware Function
  * 
  * USO: app.delete('api/users/:id', authenticate, authorize (['admin']))
  */

 exports.authorize = (roles) => {
    return (req, res, next) => {

        // Verificar si el rol del usuario esta en la lista de roles permitidos
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes autorización para realizar esta acción',
                requiredRoles: roles, // roles que si tienen acceso 
                currentRole: req.user.role, // usuario que intenta ingresar
                details: `Tu rol es "${req.user.role}
                pero se requiere uno de: ${roles.join(', ')}`   
            });
        }

        // Si el usuario tiene el permiso continuar
        next();
    };
 };