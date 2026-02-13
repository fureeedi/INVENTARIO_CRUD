//Carga las varibales de entorno desde el archivo .env
require('dotenv').config();

module.exports = {
    //clave firma para los token de jwt
    secret: process.env.SECRET_KEY || "tusecretoparalostokens",
    //tiempo de expiracion del token en segundos
    jwtExpiration: process.env.JWT_EXPIRATION || 86400, // 24 HORAS
    //tiempo de expiracion de refrescar token 
    jwtRefresh: 6048000, // 7 DIAS
    //numero de rondas para encriptar la contraseña
    slatRounds: process.env.SALT_ROUNDS || 8
};