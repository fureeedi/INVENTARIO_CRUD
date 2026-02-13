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
            message: 'Usuario registrado exitosamente!',
            token: token,
            user: userResponse
        });

    }catch(error) {
        return res.status(500).json({
            success: false,
            message: 'Error en el registro de usuario!',
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
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({
                success: false,
                message: 'Email o Username requerido!'
            });
        }

        //validar que se envie la contraseña
        if (!req.body.password) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña requerida'
            });
        }

        //Buscar usuario por email o username
        const user = await User.FindOne({
            $or: [ // funciona como un "o" lógico - ARRAY - agarra cualquiera de los dos o los que esten 
                { username: req.body.username },
                { email: req.body.email }
            ]
        }).select('+password'); //Include password field

        //Si no existe el usuario 
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar que el usuario tenga contraseña
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'El usuario no tiene contraseña!'
            });
        }

        // Comparar la contraseña enviada con el hash almacenado - HASH: Contraseña encriptada
        const ispasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!ispasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta!'
            });
        }

        //Generar token JWT que expira en 24 horas
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email
            },

            config.secret,
            { expiresIn: config.jwtExpiration }
        );

        // Prepara respuestas sin mostrar la contraseña
        const UserResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        //POSTMAN 200 AFIRMATIVO - Usuario registrado exitosamente
        res.status(200).json({
            success: true,
            message: 'Inicio de sesi+on exitoso!',
            token: token,
            user: UserResponse
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en el inicio de sesión!'
        });
    }
};