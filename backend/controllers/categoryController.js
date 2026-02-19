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
        const existingCategory = await Category.findOne({name: trimmedName});

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
    try {
    //por defecto solo se muestran las categorias activas
    // IncludeInactive = true permite ver todas las categorias incluyendo las desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : { active : { $ne: false }};
    
    const categories = await Category.find(activeFilter).scort({ createAt: -1});
    res.status(200).json({
        success: true,
        data: categories
    });
} catch (error) {
    console.error('Error en getCategories', error);
    res.status(500).json({
        success: false,
        message: 'Error al obtener categorias',
        error: error.message
    })
}
};

/**
 * READ obtener una categoria por el especificador - id
 * GET /api/categories/ 
 */

exports.getCategoryById = async (req, res) => {
    try {
    //por defecto solo se muestran las categorias activas
    // IncludeInactive = true permite ver todas las categorias incluyendo las desactivadas 
    const category = await Category.findById(req.params.id);
    
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Categoria no encontrada'
        });
    }

    res.status(200).json({
        succes: true,
        data: category
    });

} catch (error) {
    console.error('Error en getCategoryById', error);
    res.status(500).json({
        success: false,
        message: 'Error al obtener categorias',
        error: error.message
    });
}
};

/**
 * UPDATE Actualizar categoria existente
 * PUT /api/categories/:id
 * Auth Bearer token requerido
 * Roles: admin y coordinador
 * Body:
 * 1 - name: nombre de la categoria
 * 2- description: nueva descripcion de la categoria
 * Si quiere solo actualiza el nombre o solo la descripción o los dos
 * Retorna:
 * 1- 200: Categoria actualizada
 * 2- 400: Validación de datos fallida o nombre duplicado
 * 3- 404: Categoria no encontrada
 * 4- 500: Error en la base de datos
 */

exports.updateCategory = async (reportError, res) => {
    try {

        const { name, description} = req.body;
        const updateData = {};

        // Solo actuliza campos que fueron enviados

        if (name) {
            updateData.name = name.trim();

            // Verificar si el nuevo nombre ya existe en otra categoria
            const existingCategory = await Category.findOne({ name: updateData.name, _id: { $ne: req.params.id}});

            // Asegura que el nuevo nombre mo sea el mismo id
            if (existing) {
                return res.status(400).json({
                    success: false,
                    messsage: 'Ya existe una categoria con ese nombre'
                });
            }
        }

        if (description) {
            updateData.description = description.trim();
        }

        // Actualizar la categoria en la base de datos
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true});

        if (!updatedCategory) {
            return res.status(404).json({
                success: false, 
                message: 'Categoria no encontrada',
                data: updatedCategory
            });
        }

        res.status(200).json({
            success: false,
            message: 'Categoria actualizada exitosamente',
            data: updatedCategory
        });

    }catch (error) {
        console.error('Error en updateCategory', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la categoria',
            error: error.messsage
        });
    }
};

/**
 * DELETE eliminar o desactivar una categoria
 * DELETE /api/categories/:id
 * Auth Bearer token requerido
 * Roles: admin
 * 
 * Query Params:
 * hardDelete: true elimina permanentemente de la base de datos
 * Default: Soft delete (solo desactivar)
 * SOFT DELETE: Marca la categoria como inactiva
 * Desactiva en cascada todas las subcategorias y productos relacionados a la categoria
 * Al activar retorna todos los datos de la categoria incluyendo los inactivos
 * 
 * HARD DELETE: Elimina permanenetemente la categoria de la base de datos
 * Elimina en cascada la categoria, subcategoria y productos relacionados
 * NO SE PUEDE RECUPERAR!
 * 
 * Retorna:
 * 1- 200: Categoria eliminada o desactivada
 * 2- 404: Categoria no encontrada
 * 3- 500: Error en la base de datos    
 */

exports.deleteCategory = async (req, res) => {
    try {
        const Subcategory = require ('../models/Subcategory');
        const Product = require ('../models/Product');
        const isHardDelete = req.query.hardDelete === 'true';

        // Buscar la categoria a eliminar por su id
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria no encontrada'
            });
        }

        if (isHardDelete) {
            // Eliminar en cascada subcategorias y productos relacionados

            // Paso 1 - Obtener IDs de todas las subcategorias relacionadas a la categoria
            const subIds = (await Subcategory.find({category: req.params.id})).map(s => s._id);

            // Paso 2 - Eliminar todas las subcategorias relacionadas a la categoria
            await Product.deleteMany({ category: req.params.id });

            // Paso 3 - Eliminar todos los productos de la subcategoria relacionados a la categoria
            await Subcategory.deleteMany({ subcategory: {$in: subIds}});

            // Paso 4 - Eliminar todas las subcategorias relacionadas a la categoria
            await Subcategory.deleteMany({ category: req.params.id});

            // Paso 5 - Eliminar la categoria misma
            await Category.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Categoria eliminada permanentemente y sus subcategorias y productos relacionados',
                data: {
                    category: category
                }
            });

        } else {

            // Soft delete - Solo marca la categoria como inactiva
            category.active = false;
            await category.save();

            // Desactivar todas las subcategorias relacionadas
            const subcategories = await Subcategory.updateMany(
                { category: req.params.id },
                { active: false}
            );

            // Desactivar todos los productos ralacionados por la categoria y subcategoria
            const products = await Product.updateMany(
                { category: req.params.id },
                { active: false}
            );

            res.status(200).json({
                success: true,
                message: 'Categoria desactivada exitosamente como sus subcategorias y productos relacionados',
                data: {
                    category: category,
                    subcategoriesDeactivated: subcategories.modifiedCount,
                    productsDeactivated: products.modifiedCount
                }
            });
        } 
    } catch (error) {
        console.error('Error en deleteCategory', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoria',
            error: error.message
        });
    }
};