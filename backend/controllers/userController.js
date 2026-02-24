/**
 * Controlador de usuarios
 * Este modulo maneja todas las operaciones del crud para gestion de usuarios
 * Incluye control de acceso basado en roles
 * Roles permitidos: admin, coordinador y auxiliar
 * Seguridad.
 * Las contraseñas nunca se devuelven es respuestas 
 * Los auxiliares no pueden ver y actualizar otros usuarios
 * Los corrdinadores no pueden ver a los administradores 
 * Activar y desactivar usuarios 
 * Eliminar permenentemente un usuario solo lo puede hacer admin
 * 
 * OPERACIONES 
 * getAlluser listar usuarios con filtro rol
 * getUserById obtener un usuario especifico
 * createUser crear un nuevo usuario con validación
 * updateUser actualizar un usuario con restricciones de rol
 * deleteUser eliminar un usuario con restricciones de rol
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Obtener lista de usuarios
 * GET /api/users
 * Auth: Bearer token requerido
 * query params incluir activo o desactivado
 * 
 * Retorna
 * 1 - 200: array de usuarios filtrados
 * 2 - 500: error de servidor
 */

exports.getAllUsers = async (req, res) => {
    try {

        // Por defecto solo muestra usuarios activos
        const includeInactive = req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : { active : { $ne : false }};
        
        let users; 
        // Control de acceso basado en rol
        if (req.user.role === 'auxiliar') {
            // los auxiliares solo pueden verse a si mismo 
            users = await User.find({_id: req.UserId, ...activeFilter}).select('-password');
        } else {
            // Los admin y coordinadores ven todos los usuarios
            users = await User.find(activeFilter).select('-password');
        }

        res.status(200).json({
            success: true,
            data: users,
        });

    } catch (error) {
        console.error('[CONTROLLER] Error en getAllUsers', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
};

/**
 * READ obtener un usuario especifico por id 
 * GET /api/users/:id
 * Auth token requerido
 * Retorna:
 * 1 - 200: Usuario encontrado
 * 2 - 403: Sin permiso para ver al usuario
 * 3 - 404: Usuario no encontrado
 * 4 - 500: Error en el servidor 
 */

exports.getUserById = async (req, res) => {
    try {

        const user = await user.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Validaciones de acceso
        // Los auxiliares solo pueden ver su propio perfil
        if (req.user.Role === 'auxiliar' && req.userId!== req.params.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este usuario'
            });
        }

        // Los coordinadores no pueden ver a los administradores
        if (req.user.Role === 'coordinador' && role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No puedes ver usuarios admin'
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Error en getUserById', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al encontrar al usuario especifico',
            error: error.message
        });
    }
};

/**
 * CREATE crear un nuevo usuario
 * POST api/users
 * Auth token requerido
 * Roles: admin y coordinador (con restricciones)
 * VALIDACIONES
 * 1 - 201: Usuario creado
 * 2 - 400: Validación fallida
 * 3 - 500: Error de servidor
 */

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Crear usuario nuevo
        const user = new User ({
            username,
            email,
            password,
            role
        });

        // Guardar usuario en DB
        const savedUser = await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
            }
        });

    } catch (error) {
        console.error('Error en createUser', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el usuario',
            error: error.message
        });
    }
};

/**
 * UPDATE actualizar un usuario existente
 * PUT /api/users/:id
 * Auth token requerido
 * VALIDACIONES
 * - Auxiliar solo puede actualizar su propio perfil
 * - Auxiliar no pude cambiar su rol
 * - Admin y Coodinador pueden actualizar otros usuarios
 * Retorna:
 * 1 - 200: Usuario actualizado
 * 2 - 403: Sin permiso para actualizar el usuario
 * 3 - 404: Usuario no encontrado
 * 4 - 500: Error en el servidor
 */

exports.updateUser = async (req, res) => {
    try {

        // Resctricciones: Auxiliar solo puede actualizar su propio perfil
        if (req.userRole === 'auxiliar' && req.userId.
        toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este usuario'
            });
        }

        // Resctricciones: Auxiliar no puede cambiar su rol
        if (req.userRole === 'auxiliar' && req.body.role) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para modificar su rol'
            });
        }

        // Actualizar usuario
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            {new: true} //Retorna documento actualizado
        ).select('-password'); // No retornar contraseña
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error en updatedUser', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el usario',
            error: error.message
        });
    }
};

/**
 * DELETE eliminar usuario
 * DELETE /api/users/:id
 * Auth token requerido
 * Roles: admin
 * Query params: 
 * hardDelete = true - eliminar permanentemente
 * default soft delete (solo desactivar)
 * 
 * - El admin solo puede desactivar otro admin
 * 
 * Retorna:
 * 1 - 200: Usuario eliminado o desactivado
 * 2 - 403: Sin permiso para eliminar usuario
 * 3 - 404: Usuario no encontrado
 * 4 - 500: Error en el servidor
 */

exports.deleteUser = async (req, res) => {
    try {

        const hardDelete = req.query.hardDelete === 'true';
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (req.userRole === 'admin' && userToDelete.role.__id.toString() !== req.userId.
            toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar o desactivareste administradores'
            });
        }

        if (hardDelete) {

            // Eliminar permanentemente de la base de datos
            await User.findByIdAndDelete ( req.params.id );

            res.status(200).json({
                success: true,
                message: 'Usuario eliminado permanentemente',
                user: userToDelete
            });

        } else {

            // Desactivar usuario
            userToDelete.active = false;
            await userToDelete.save();

            res.status(200).json({
                success: true,
                message: 'Usuario desativdo',
                data: userToDelete
            });
        }

    } catch (error) {
        console.error('Error en deleteUser', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar el usuario',
            error: message.error
        });
    }
};