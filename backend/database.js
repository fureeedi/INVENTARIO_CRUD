/**
 * Modulo de conexió a la base de datos
 * - Este archivo maneja la conexión de la base de datos a mongoDB utilizando Mongoose
 * - Establece la conexión con la base de datos
 * - Configura la opciones de conexión
 * - Maneja los errores de conexión
 * - Exporta la función connectDB para usarla en el server.js
 */

const mongoose = require('mongoose');
const {DB_URI} = process.env;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true ,
            useUnifiedTopology: true,
            
        });
        console.log('conexion a la base de datos establecida');
    } catch(error){
        console.error('error al conectar a la base de datos: ', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;