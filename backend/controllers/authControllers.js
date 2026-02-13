/**
 * Controladores de autenticación para el backend.
 * Maneja el registro de login y generación de tokens JWT.
 */

const User = require('../models/User');
const brypt = require('bcryptjs'); //encriptar es un modelo de seguridad para las contraseñas por eso se utiliza bcryptjs - y no se pone la carpeta 
const jwt = require('jsonwebtoken'); //para generar el token de autenticación
const config = require('../config/auth.config'); //para obtener la clave secreta del JWT

/**
 * SING UP - Registro o creación de usuario
 * POST /api/auth/signup - RUTA
 * BODY: { username, email, password, role }
 * Crea usuario en la base de datos
 * Encripta la contraseña antes de guardar con bcryptjs
 * Genera token JWT para el usuario registrado
 * Retorna usuario sin mostrar contraseña
 */
                     //NOTA: Que es? 
exports.signup = async (req, res) => {
    try {
        //Crear nuevo usuario
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'auxiliar' //Por defecto, el rol es 'auxiliar' si no se especifica
        });

        // Guardar en base de datos
        //La contraseña se encripta automaticamente en el middleware del modelo
        const savedUser = await user.save();

        //Generar token JWT que expira en 24 horas
        const token = jwt.sign(
            {
                id: savedUser._id,
                role: savedUser.role,
                email: savedUser.email
            },
            config.secret,
            { expiresIn: config.jwtExpiration }
        );

        //Preparando respuesta sin mostrar la contraseña
        const userResponse = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
        };

        //POSTMAN 200 AFIRMATIVO - Usuario registrado exitosamente
        res.status(200).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token: token,
            user: userResponse
        });
    }catch(error) {
        return res.status(500).json({
            succes: false,
            message: 'Error en el registro de usuario',
            error: error.message
        });
    }
};

/**
 * SIGN IN - Inicio de sesión
 * POST /api/auth/signin - RUTA
 * BODY: { email o usuario, password }
 * Busca el usuario pr email o username en la base de datos
 * Valida la contraseña con bcrypt
 * Si es correcto el token JWT
 * El token se usa para autenticar las futuras solicitudes del usuario 
 */

exports.sigin = async (req, res) => {
    try {
        //Validar que se envie el email o username
        if (!req.body.email $$ !req.body.username) {
            return res.status(400).json({
                success: false,
                message: 'email o username requerido'
            });
        }
    }
}