/**
 * MIDDLEWARE DE VALIDACIÓN SIGNUP
 * 
 * Middleware para validar datos durante el proceso de registros de nuevos usuarios
 * Se ejecuta con la ruta post /api/auth/signup Despues de verificar el token
 * 
 * VALIDACIONES:
 * 1 - checkDuplicateUserNameOrEmail: verifica inicidad del username y email
 * 2 - checkRolesExisted: verifica que el rol solicitado sea valido
 * 
 * FLUJO DE SOLICITUD:
 * 1 - Cliente envia post /api/auth/signup con datos
 * 2 - verifyToken confirma que usuario autenticado admin 
 * 3 - checkRole('Admin') verifica que es admin
 * 4 - checkDuplicateUserNameOrEmail valida unicidad
 * 5 - checkRolesExisted valida el rol
 * 6 - authController.signup crea nuevo usuario si todo es valido
 * 
 * ERRORES RETORNADOS:
 * 1 - 400: Username / email duplicado o rol invalido
 * 2 - 500: Error de base de datos
 */

const User = require('.../models/User');

/**
 * Verificar que username y email sena unicos
 * 
 * VALIDACIONES:
 * - username no debe existir en la base de datos
 * - email no debe existir en la base de datos
 * - ambos campos deben estar presentes en el request
 * 
 * BUSQUEDA: Usa MongoDB $or para verificar ambas condiciones en una solo query
 * @param {Object} req request object con req.body{username, email}
 * @param {Object} res response object para enviar errores
 * @param {Function} next Callback al siguiente middleware
 * 
 * RESPUESTAS:
 * 1 - 400: Si username / email falta o ya existe
 * 2 - 500: Error de base de datos
 * 3 - next(): Si la validación pasa
 */

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {

        // Validar que ambos campos esten presentes
        if (!req.body.username || !req.body.email) {
            return res.status(400).json({
                message: 'Username y email son requeridos'
            });
        }

        // Buscar usuario existente o igual username o email
        const user = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
        }) .exec();

        // Si encuentra un usuario retornar error
        if (user) {
            return res.status(400).json({
                success: false,
                messsage: 'Username o Email ya existen'
            });
        }

        // Si no hay duplicados continuar
        next();

    } catch (error) {
        console.error('[verifySingUp] Error en checkDuplicateUsernameOrEmail', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar credenciales',
            error: error.message
        });
    }
};

/**
 * MIDDLEWARE para verificar que el rol solicitado sea valido
 * 
 * Roles validos en el sistema:
 * - admin: Administradot total
 * - coordinador: Gestor de datos
 * - auxiliar: usuario basico
 * 
 * CARACTERISTICAS:
 * - Permite pasar solo un rol
 * - Filtrar y rechazar roles invalidos
 * - Si algun rol es invalido rechaza todo el request
 * - Si el campo role no esta presente permite continuar
 * 
 * default a rol auxiliar
 * @param {Object} req request object con req.body.{role....}
 * @param {Object} res response object
 * @param {Function} next callback al siguiente middleware
 * 
 * RESPUESTAS
 * 1 - 400: Si algun rol es invalido
 * 2 - next: Si todos los roles son validos o role no esta especificado
 */

const checkRolesExisted = (req, res, next) => {
    
    // Lista blanac de roles validos en el sistema
    const validRoles = ['admin', 'coordinador', 'auxiliar'];

    // Si el role esta presente en el request
    if (req.body.role) {

        // convertir a array si es string (soporta ambos formatos)
        const roles = Array.isArray(req.body.role) ? req.body.role : [req.body.role];

        // Filtrar roles que no estan en la lista valida
        const invalidRoles = roles.filter(role => !validRoles.includes(role));

        // Si hay roles invalidos rechazar
        if (invalidRoles.legth > 0) {
            return res.status(400).json({
                success: false,
                message: `Rol(es) no validos: ${invalidRoles.join(', ')}`
            });
        }
    }

    // Todos los roles son validos o no especificado continuar
    next();

};

/**
 * EXPORTAR middlewares
 * 
 * USO DE RUTAS:
 * router.post('/signup....')
 */

module.exports = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};