/**
 * Archivo de configuración central del backend
 * - Este archivo centraliza todas las configuraciones pricipales de la aplicación
 * - Configuración de JWT tokens de autenticación
 * - Configuración de conexión a MongiDB
 * - Definición de roles del sistema
 * 
 * - Las variables de entorno tienen prioridad sobre los valores por defecto
 */

module.exports = {

    // configuración de JWT
    secret: process.env.JWT_SECRET || 'tusecretoparalostokens',
    TOKEN_EXPIRATION: process.env.JWT_EXPIRATION || '24H',

    // Configuración de base de datos
    // Comparación 
    DB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/crud-mongo-taller',

    // Generación
    DB: {
        URL: process.env.MONGO_URI || 'mongodb://localhost:27017/crud-mongo-taller',
        OPTIONS: {
            userNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },

    // Roles del sistema
    ROLES: {
        ADMIN: 'admin',
        COORDINADOR: 'coordinador',
        AUXILIAR: 'auxiliar',
    }
};