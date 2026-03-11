/**
 * MIDDLEWARE control de roles de usuario
 * 
 * - Sirve para verificar qie el usuario autenticado tiene permisos necesarios para acceder a una ruta especifica
 * 
 * function factory checkRole() : Permite especificar los roles permitidos
 * function Helper - para roles especificos isAdmin, isCoordinator, isAuxiliar
 * Requiere que verifyTokenFn se haya ejecutado primero
 * 
 * FLUJO:
 * 1 - Verifica que req.userRole exista
 * 2 - Compara req.userRole contra la lista de roles permitidos
 * 3 - Si esta en lusta continua
 * 4 - Si no esta en la lista retorna 403 Forbidden con mensaje de acceso descriptivo
 * 5 - Si no existe userRole retorna 401 (Token corrupto)
 * 
 * USO:
 * checkRole('admin') solo admin
 * checkRole('admin', 'coordinator') admin y coordinador co permisos
 * checkRole('admin', 'coordinator', 'auxiliar') todos con permisos
 * 
 * ROLES DEL SISTEMA:
 * - admin : acceso total
 * - coordinador : no puede eliminar ni gestionar usuarios
 * - auxiliar : acceso limitado a tareas especificas  
 */

/**
 * factory function checkRole
 * - Retorna middleware que verifica que el usuario tiene uno de los roles permitidos
 * @param {...string} allowedRoles - Roles permitidos en el sistema
 * @returns {function} - middleware de express 
 */

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {

        // Validar que el usuario fue autenticado y verifyToken ejecutado
        // req.userRole es establecido por verifyTokenFn middleware 
        if (!req.userRole) {
            return res.status(401).json({
                success: false,
                message: 'Token invalido o expirado'
            });
        }

        // Verificar si el rol del usuario esta en la lista de roles permitidos
        if(!allowedRoles.includes(req.uerRole)) {
            return res.status(403).json({
                success: false,
                message: `Permisos insuficientes se requiere: ${allowedRoles.join(' o ')}`
            });
        }

        //Usuario 
        next();
    }
};

// Funciones helper para roles especificos
// Verifica que el usuario es admin
// USO: router.delete('/admin-only'. verifyToken, isAdmin, controller.method)

// Verifica si el usuario es Admin
const isAdmin = (req, res, next) => {
    return checkRole('admin')(req, res, next);
};

// Verifica si el usuario es Coordinador
const isCoordinador = (req, res, next) => {
    return checkRole('coordinador')(req, res, next);
};

// Verifica si el usuario es Auxiliar
const isAuxiliar = (req, res, next) => {
    return checkRole('auxiliar')(req, res, next);
};

// Modulos a exportar
module.exports = {
    checkRole,
    isAdmin,
    isCoordinador,
    isAuxiliar
}