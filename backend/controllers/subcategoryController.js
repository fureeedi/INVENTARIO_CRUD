/**
 * Contralador de subcategorias
 * maneja todas la operaciones CRUD relacionadas con las subcategorias
 * Estructura: una subcategoria depende de una categoria padre, una categoria puede tener varias subcategorias, una subcategoria puede tener varios productos relacionados
 * Cuando una subcategoria se elimina los producto srelaiconados se desactivan
 * Cuando se ejecuta en cascada SOFT DELETE se eliminan de manera permanente  
 */

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

/**
 * Create: Crear una nueva subcategoria
 * Post: /api/subcategories
 * Auth: Bearer token requerido
 * Roles: admin y coordinador
 * Body requerido:
 * 1 - name: nombre de la subcategoria
 * 2 - description: descripcion de la subcategoria
 * retorna:
 * 1 - 201: Subcategoria creada en MongoDB
 * 2 - 400: Validación de datos fallida o nombre duplicado
 * 3 - 404: Categoria padre no existe
 * 4 - 500: Error en la base de datos
 */

exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, category, } = req.body;

        // Validar que la categoria padre exista
        const parentCategory = await Category.findById(category);

        if (!parentCategory){
            return res.status(404).json({
                success: false,
                message: 'La categoria no existe'
            });
        }

        // Crear la nueva Subcategoria
        const newSubcategory = new Subcategory({
            name: name.trim(), // Guardar el nombre sin espacios en blanco al crear la categoria
            description: description.trim(), // Guardar la descripcion sin espacios en blanco al crear la categoria
            category: category
        });

        await newSubcategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategoria creada exitosamente',
            data: newSubcategory
        });

    } catch (error) {
        console.error('Error en crear la Subcategoria', error)

        // Manejo de error de indice unico
        if (error.message.includes ('duplicate key') || error.message.includes ('Ya existe')){
            return res.status(400).json({
                success: false,
                message: 'Ya existe una Subcategoria con ese nombre'
            });
        }

        // Error general del servidor
        res.status(500).json({
            success: false,
            message: 'Error al crear la subcategoria',
        });
    }
};

/**
 * GET consultar listado de Subcategorias
 * GET /api/subcategories
 * por defecto retorna solo las tres subcategorias activas
 * con includeInactive = true retorna todas las subcategorias incluyendo las inactivas
 * Ordena por fecha de creación descendente
 * Retorna:
 * 1 - 200: Lista de Subcategorias
 * 2 - 500; Error en la base de datos 
 */

exports.getSubcategories = async (req, res) => {
    try {
    //por defecto solo se muestran las subcategorias activas
    // IncludeInactive = true permite ver todas las subcategorias incluyendo las desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : { active : { $ne: false }};
    
    const subcategories = await Subcategory.find(activeFilter).populate('category', 'name');
    res.status(200).json({
        success: true,
        data: subcategories
    });

} catch (error) {
    console.error('Error al obtener subcategorias', error);
    res.status(500).json({
        success: false,
        message: 'Error al obtener subcategorias',
    })
}
};

/**
 * READ obtener una subcategoria por el especificador - id
 * GET /api/subcategories/:id
 */

exports.getSubcategoryById = async (req, res) => {
    try {
    //por defecto solo se muestran las subcategorias activas
    // IncludeInactive = true permite ver todas las subcategorias incluyendo las desactivadas 
    const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name');
    
    if (!subcategory) {
        return res.status(404).json({
            success: false,
            message: 'Subcategoria no encontrada',
        });
    }

    res.status(200).json({
        success: true,
        data: subcategory
    });

} catch (error) {
    console.error('Error en obtener subcategoria por id', error);
    res.status(500).json({
        success: false,
        message: 'Error al obtener subcategoria por id',
    });
}
};

/**
 * UPDATE Actualizar subcategoria existente
 * PUT /api/subcategories/:id
 * Auth Bearer token requerido
 * Roles: admin y coordinador
 * Body:
 * 1 - name: nombre de la subcategoria
 * 2- description: nueva descripcion de la subcategoria
 * 3- category: nuevo id de la categoria
 * VALIDACIONES:
 * - Si se cambia la categoria, verifica que exista
 * - Si quiere solo actualiza el nombre o solo la descripción o los dos
 * Retorna:
 * 1- 200: Subcategoria actualizada 
 * 3- 404: Subcategoria no encontrada
 * 4- 500: Error en la base de datos
 */

exports.updateSubcategory = async (req, res) => {
    try {

        const { name, description, category} = req.body;

        // Verificar si cambia la categoria padre 

        if (name) {
            const parentCategory = await Category.findById(category);
            if (!parentCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoria no existe'
                });
            }
        }

        // Construir el objeto de actualización solo con campos enviados 
        const updateSubcategory = await Subcategory.findByIdAndUpdate(req.params.id, { name: name ? name.trim() : undefined, description: description ? description.trim() : undefined, category}, { new: true, runValidators: true});

        if (!updateSubcategory) {
            return res.status(404).json({
                success: false, 
                message: 'Subcategoria no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subcategoria actualizada exitosamente',
            data: updateSubcategory
        });

    }catch (error) {
        console.error('Error en actualizar subcategoria', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la subcategoria',
        });
    }
};

/**
 * DELETE eliminar o desactivar una subcategoria
 * DELETE /api/subcategories/:id
 * Auth Bearer token requerido
 * Roles: admin
 * 
 * Query Params:
 * hardDelete: true elimina permanentemente de la base de datos
 * Default: Soft delete (solo desactivar)
 * SOFT DELETE: Marca la subcategoria como inactiva
 * Desactiva en cascada todas las subcategorias y productos relacionados a la categoria
 * Al activar retorna todos los datos de la categoria incluyendo los inactivos
 * 
 * HARD DELETE: Elimina permanenetemente la subcategoria de la base de datos
 * Elimina en cascada la subcategoria y productos relacionados
 * NO SE PUEDE RECUPERAR!
 * 
 * Retorna:
 * 1- 200: Subcategoria eliminada o desactivada
 * 2- 404: Subcategoria no encontrada
 * 3- 500: Error en la base de datos    
 */

exports.deleteSubcategory = async (req, res) => {
    try {
        const Product = require ('../models/Product');
        const isHardDelete = req.query.hardDelete === 'true';

        // Buscar la subcategoria a eliminar por su id
        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        if (isHardDelete) {
            // Eliminar en cascada subcategorias y productos relacionados

            // Paso 1 - Obtener IDs de todos los productos realacionados
            await Product.deleteMany({ subcategory: req.params.id});

            // Paso 2 - Eliminar la subcategoria misma
            await Subcategory.findByIdAndDelete( req.params.id);

            res.status(200).json({
                success: true,
                message: 'Subcategoria eliminada permanentemente y sus productos relacionados',
                data: {
                    subcategory: subcategory
                }
            });

        } else {

            // Soft delete - Solo marca la subcategoria como inactiva con cascada
            subcategory.active = false;
            await subcategory.save();

            // Desactivar todos los productos ralacionados
            const products = await Product.updateMany(
                { subcategory: req.params.id },
                { active: false}
            );

            return res.status(200).json({
                success: true,
                message: 'Subcategoria desactivada exitosamente como sus productos asociados',
                data: {
                    subcategory: subcategory,
                    productsDeactivated: products.modifiedCount
                }
            });
        }
    } catch (error) {
        console.error('Error en al desactivar la subcategoria', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar la subcategoria',
            error: error.message
        });
    }
};