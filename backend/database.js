/**
 * Modulo de conexió a la base de datos
 * - Este archivo maneja la conexión de la base de datos a mongoDB utilizando Mongoose
 * - Establece la conexión con la base de datos
 * - Configura la opciones de conexión
 * - Maneja los errores de conexión
 * - Exporta la función connectDB para usarla en el server.js
 */

const mongoose = require('mongoose');
const { DB_URI } = process.env;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true, // Nueva conexión - busca puerto
            useUnifiedTopology: true, 
        });

        console.log('OK MongoDB conectado')
    } catch (error) {
        console.error('Error de conexión a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;