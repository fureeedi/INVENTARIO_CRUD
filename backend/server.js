/**
 *  SERVIDOR PRINCIPAL
 * - Punto de entrada a la aplicación backend
 * - Configura Express, cors, conecta MongoDB, define rutas y conecta con el frontend 
 */

require('dotenv').config(); // Carga todas las variables de entorno
const express = require('express'); // Conexión a traves del framework - HTTP
const mongoose = require('mongoose'); // Conexión a MongoDB
const cors = require('cors'); // Conexión a frontend
const morgan = require('morgan'); // Registra todas las solicitudes HTTP
const config = require('./config');

/**
 * VALIDACIONES INICIALES
 * - Verifica que las variables de entorno requeridas esten definidas
 */
const mongoUri = process.env.MONGODB_URI || config.DB.URL;

if (!mongoUri) { // variable de entorno existe
    console.error('Error: MONGO_URI no esta definida en .env');
    process.exit(1);
}

if(!process.env.JWT_SECRET) { // definida jsonwebtoken
    console.error('Error: JWT_SECRET no esta definida en .env');
    process.exit(1);
}

// Importar todas las rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// Iniciar express
const app = express(); // conexiones 

// Cors permite las solicitudes desde el frontend
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Morgan registra todas las solicitudes HTTP en consola
app.use(morgan('dev'));

// Express JSON pasa bodies en formato JSON
app.use(express.json());

// Express URL encoded soporta datos form-encoded
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(mongoUri, config.DB.OPTIONS)
    .then(() => console.log('OK MongoDB conectado'))
    .catch((error) => {
        console.error('Error de conexión a MongoDB:', error.message);
        process.exit(1);
    });

// Registra Rutas

// Rutas de autenticación de login
app.use('/api/auth', authRoutes);

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Rutas de productos CRUD
app.use('/api/products', productRoutes);

// Rutas de categorías CRUD
app.use('/api/categories', categoryRoutes);

// Rutas de subcategorias CRUD
app.use('/api/subcategories', subcategoryRoutes);

// Rutas de estadísticas
app.use('/api/statistics', statisticsRoutes);

//ruta base opcional para verificar que el servidor responde
app.get('/', (req, res) => res.send('Backend funcionando'));

// Manejo de errores
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
    });
});

// middleware global de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
    });
});

// listeners para errores de promesas no manejadas o excepciones
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', error => {
    console.error('Uncaught Exception thrown:', error);
    process.exit(1);
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});

// exportar la instancia de app (util para pruebas o uso en otros modulos)
module.exports = app;
