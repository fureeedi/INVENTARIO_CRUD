/**
 * Contralador de categorias
 * maneja todas la operaciones CRUD relacionadas con las categorias 
 */

const Category = require('../models/Category');

/**
 * Create: Crear una nueva categoria
 * Post: /api/categories
 * Auth: Bearer token requerido
 * Roles: admin y coordinador
 * Body requerido:
 * 1 - name: nombre de la categoria
 * 2 - description: descripcion de la categoria
 * retorna:
 * 1 - 201: Categoria creada en MongoDB
 * 2 - 400: Validación de datos fallida o nombre duplicado
 * 3 - 500: Error en la base de datos
 */

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validar de los campos de entrada
        if (!name || !typeof name === 'string' || name.trim()) {

            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoria es obligatorio y debe ser texto valido'
            });
        }

        // Limpiar espacios en blaco
        const trimmedName = name.trim();
        const trimmedDesc = description.trim();
        
        // Verificvar si ya existe una categoria con el mismo nombre
        const existingCategory = await Category.fiindOne({name: trimmedName});

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoria con ese nombre'
            });
        }

        // Crear la nueva categoria
        const newCategory = new Category({
            name: trimmedName, // Guardar el nombre sin espacios en blanco al crear la categoria
            description: trimmedDesc // Guardar la descripcion sin espacios en blanco al crear la categoria
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            messsage: 'Categoria creada exitosamente',
            data: newCategory
        });

    } catch (error) {
        console.error('Error en createCategory', error)

        // Manejo de error de indice unico
        if (error.code === 11000){
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoria con ese nombre'
            });
        }

        // Error general del servidor
        res.status(500).json({
            success: false,
            message: 'Error al crear la categoria',
            error: error.message
        });
    }
};

/**
 * GET consultar listado de categorias
 * GET /api/categories
 * por defecto retorna solo las tres categorias activas
 * con includeInactive = true retorna todas las categorias incluyendo las inactivas
 * Ordena por fecha de creación descendente
 * Retorna:
 * 1 - 200: Lista de categorias
 * 2 - 500; Error en la base de datos 
 */

exports.getCategories = async (req, res) => {

    //por defecto solo se muestran las categorias activas
    // IncludeInactive = true permite ver todas las categorias incluyendo las desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const actveFilter = includeInactive ? {} : { active : { $ne: false }};
    
    const categories = await Category.find(activeFilter).scort({ createAt: -1});
    res.status(200).json({
        success: true,
        data: categories
    });
};