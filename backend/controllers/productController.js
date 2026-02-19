/**
 * Contralador de productos
 * maneja todas la operaciones CRUD relacionadas con los productos 
 * Estructura: una subcategoria depende de una categoria padre, una categoria puede tener varias subcategorias, una subcategoria puede tener varios productos relacionados
 * Cuando una subcategoria se elimina los producto srelaiconados se desactivan
 * Cuando se ejecuta en cascada SOFT DELETE se eliminan de manera permanente  
 */

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * Create: Crear un nuevo producto
 * Post: /api/products
 * Auth: Bearer token requerido
 * Roles: admin y coordinador
 * Body requerido:
 * 1 - name: nombre del producto
 * 2 - description: descripcion del producto
 * retorna:
 * 1 - 201: Producto creado en MongoDB
 * 2 - 400: Validación de datos fallida o nombre duplicado
 * 3 - 404: Categoria padre no existe
 * 4 - 404: Subcategoria no existe
 * 5 - 500: Error en la base de datos
 */

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;

        // Validar que la categoria padre exista
        const parentCategory = await Category.findById(category);

        if (!parentCategory){
            return res.status(404).json({
                success: false,
                message: 'La categoria no existe'
            });
        }

        // Validar que la subcategoria exista
        const parentSubcategory = await Subcategory.findById(subcategory);

        if (!parentSubcategory){
            return res.status(404).json({
                success: false,
                message: 'La subcategoria no existe'
            });
        }

        // Crear el nuevo Producto
        const newProduct = new Product({
            name: name.trim(), // Guardar el nombre sin espacios en blanco al crear la categoria
            description: description.trim(), // Guardar la descripcion sin espacios en blanco al crear la categoria
            price: price,
            stock: stock,
            category: category,
            subcategory: subcategory
        });

        await newProduct.save();
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: newProduct
        });

    } catch (error){
        console.error('Error al crear el Producto', error)

        // Manejo de error de indice unico
        if (error.message.includes ('duplicate key') || error.message.includes ('Ya existe')){
            return res.status(400).json({
                success: false,
                message: 'Ya existe un Producto con ese nombre'
            });
        }

        // Error general del servidor
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto'
        });
    }
};

/**
 * GET consultar listado de productos
 * GET: /api/products
 * Por defecto devuelve los productos activos, se pueden filtrar por categoria o subcategoria
 * Con includeInactive = true retorna todos los productos incluyendo los inactivos
 * Con category = idCategoria retorna los productos de esa categoria
 * Con subcategory = idSubcategoria retorna los productos de esa subcategoria
 * Ordena por fecha de creación descendente
 * Retorna:
 * 1 - 200: Lista de productos
 * 2 - 500: Error en la base de datos
 */

exports.getProducts = async (req, res) => {
    try {
        // Por defecto solo se muestran los productos activos
        // IncludeInactive = true muestra todos los productos incluyendo los inactivos
        const includeInactive = req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : { active : { $ne: false }};

        const products = await Product.find(activeFilter).populate('category', 'name').populate('subcategory', 'name');
        res.status(200).json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('Error al obtener productos', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos'
        });
    }
};

/**
 * READ consultar un producto por ID
 * GET: /api/products/:id
 * Retorna:
 * 1 - 200: Producto encontrado
 * 2 - 404: Producto no encontrado
 * 3 - 500: Error en la base de datos
 */

exports.getProductById = async (req, res) => {
    try {
        // Por defecto solo se muestran los productos activos
        // IncludeInactive = true muestra el producto aunque este inactivo
        const product = await Product.findById(req.params.id).populate('category', 'name').populate('subcategory', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Error al obtener el producto por id', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto por id',
        });
    }
};

/**
 * UPDATE actualizar un producto por ID
 * PUT: /api/products/:id
 * Auth: Bearer token requerido
 * Roles: admin y coordinador
 * Body:
 * 1 - name: nombre del producto
 * 2 - description: descripcion del producto
 * 3 - price: precio del producto
 * 4 - stock: cantidad de stock del producto
 * 5 - category: id de la categoria padre
 * 6 - subcategory: id de la subcategoria
 * VALIDACIONES:
 * - Si se cambia la categoria, verifica que exista
 * - Si se cambia la subcategoria, verifica que exista
 * - Si quiere solo actualiza el nombre, la descripción, el precio, el stock o cualquier combinación de estos
 * Retorna:
 * 1 - 200: Producto actualizado
 * 3 - 404: Producto no encontrado
 * 4 - 404: Categoria padre no existe
 * 5 - 404: Subcategoria no existe
 * 6 - 500: Error en la base de datos
 */

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;

        // Verificar si cambia la categoria padre
        if (category) {
            const parentCategory = await Category.findById(category);
            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoria no existe'
                });
            }
        }

        // Verificar si cambia la subcategoria
        if (subcategory) {
            const parentSubcategory = await Subcategory.findById(subcategory);
            if (!parentSubcategory) {
                return res.status(404).json({
                    success: false,
                    message: 'La subcategoria no existe'
                });
            }
        }
        
        // Construir el objeto de actualización solo con campos enviados
        const updateProduct = await Product.findByIdAndUpdate(req.params.id, 
        { name: name ? name.trim() : 
            undefined, description: 
            description ? description.trim() : 
            undefined, price, stock, category, subcategory
        },

        { new: true, runValidators: true});

        if (!updateProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: updateProduct
        });

    }catch (error) {
        console.error('Error en actualizar el producto', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
        })
    }
};

/**
 * DELETE eliminar o desactivar un producto
 * DELETE /api/products/:id
 * Auth Bearer token requerido
 * Roles: admin y coordinador
 * Query param:
 * HARD DELETE = true elimina de manera permanente el producto de la base de datos
 * Default: Soft delete (solo desactiva)
 * SOFT DELETE: Marca el producto como inactivo
 * HARD DELETE: Elimina permanentemente el producto de la base de datos 
 * Retorna:
 * 1 - 200: Producto eliminado o desactivado
 * 2 - 404: Producto no encontrado
 * 3 - 500: Error en la base de datos
 */

exports.deleteProduct = async (req, res) => {
    try {

        const isHardDelete = req.query.hardDelete === 'true';

        // Buscar el producto por ID
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        if (isHardDelete) {

            // Eliminar permanentemente el producto de la base de datos
            await Product.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Producto eliminado permanentemente',
            });

        } else {

            // Soft delete: marcar el producto como inactivo
            product.active = false;
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Producto desactivado exitosamente',
                data: product
            }); 
        }

    } catch (error) {
        console.error('Error al desactivar el producto', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar el producto',
        });
    }
};