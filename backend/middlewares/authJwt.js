/**
 * MIDDLEWARES DE VERIFICACIÓN JWT
 * - Middleware para verificar y validar tokens JWT en las solicitudes
 * - Se usa en todas las rutas protegidas para autenticar usuarios
 * - CARACTERISTICAS: 
 *      - Soporta dos formatos de token:
 *          - 1: Authorization: Bearer <token> (Estandar REST)
 *          - 2: x-access-token (header personalizado)
 * 
 * - Extrae información del token (id, role, email)
 * - La adjunta a req.uderId req.userRole req.userEmail para uso de los controladores
 * - Manejo de errores con codigos 403/401 apropiados
 * 
 * FLUJO:
 * 1- Lee el header Authorization o x-access-token
 * 2- Extrae el token (quita el Bearer si es necesario)
 * 3- Verifica el token con JWT_SECRET
 * 4- Si es valido continua al siguiente middleware
 * 5- Si es invalido retorna 401 Unauthorized
 * 6- Si falta el token retorna 403 Forbidden
 * 
 * VALIDACIÓN DEL TOKEN
 * 1- Verifica firma criptografica con JWT_SECRET
 * 2- Comprueba que no haya expirado
 * 3- Extrae payload {id, rol, email}
 */

const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

/**
 * VERIFICAR TOKEN
 * Funcionalidad:
 * - Busca el token en las ubicaciones posibles (orden de procedencia)
 * 1 - header Authorization con formato Bearer <token> - trae token
 * 2 - header x-access-token - trae token mas informacion adjunta {id, role, email}
 * - Si encuentra el token verifica su validez
 * - Si no encuentra retorna 403 Forbidden
 * - Si el token es invalido/expirado retorna 401 Unauthorized
 * - Si es valido adjunta datos del usuario a req.user y continua
 * 
 * Headers soportados:
 * 1 - Authorization bearer <asdfghjklñ...>
 * 2 - x-access-token: <asdfghjklñ...> id, role, email
 * - Propiedades del request despues del middleware:
 * req.userId = (string) Id del nuevo usuario MongoDB
 * req.userRole = (string)  rol del usuario (admin, coordinador, auxiliar)
 * req.userEmail = (string) email del usuario
 */

const verifyTokenfn = (req, res, next) => {
    try {
        // Soporta dos formatos Authorization bearer o access-token
        let token = null;

        // Fornato Authorization
        if (req.headers.authorization && req.headers.
            authorization.startsWith('bearer')) {

            // Extraer token quitando "Bearer"
            token = req.headers.authorization.substring(7);
        }

        // Formato x-access-token
        else if (req.headers['x-access-token']) {
            token = req.headers['x-access-token'];
        }

        // Si no encuentra el token rechaza la solicitud
        if (!token) {
            return res.status(403).json({
                success: false,
                messsage: 'Token no proporcionado'
            });
        }

        // Verificar el token con la clave secreta
        const decoded = jwt.verify(token, config.secret);

        // Adjuntar información del usuario al request object para que otros middlewares y rutas puedan acceder a ella
        req.userId = decoded.id; // id de MongoDB
        req.userRole = decoded.role; // Rol de usuario
        req.userEmail = decoded.email; // Email de usuario

        // Token es valido continuar siguiente middleware o ruta
        next();

    } catch (error) {

        // token invalido o expirado
        return res.status(401).json({
            success: false,
            message: 'Token es invalido o ha expirado',
            error: error.message
        });

    }
};

/**
 * Validación de funcion para mejor seguridad y manejo de errores
 * - Verificar que verifyTokenFn sea una funcion valida
 * - Esto es una validación de seguridad para que el middleware se exporte correctamente
 * - Si algo sale mal en su definicion se arroja un error en tiempo de carga del modulo  
 */

if (typeof verifyTokenfn !== 'function') {
    console.error('verifyTokenFn no es una funcion valida');
    throw new Error('verifyTokenFn no es una funcion valida');
}

// Exportar middleware
module.exports = {
    verifyTokenfn: verifyTokenfn
}