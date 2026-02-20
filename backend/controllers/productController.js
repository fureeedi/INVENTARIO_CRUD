/**
 * Contralador de productos
 * maneja todas la operaciones CRUD relacionadas con los productos 
 * Estructura: una subcategoria depende de una categoria padre, una categoria puede tener varias subcategorias, una subcategoria puede tener varios productos relacionados
 * Cuando una subcategoria se elimina los producto srelaiconados se desactivan
 * Cuando se ejecuta en cascada SOFT DELETE se eliminan de manera permanente
 * Incluye Soft Delete (marcar como inactivo)
 * Y Hard Delete (Eliminación permanente)
 */

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * CREATE: Crear un nuevo producto
 * Post: /api/products
 * Body: { name, description, price, stock, category, subcategory }
 * Auth: Bearer token requerido
 * Roles: admin y coordinador
 * Retorna:
 * 1 - 201: Producto creado en MongoDB
 * 2 - 400: Validación de datos fallida o nombre duplicado
 * 3 - 404: Categoria padre no existe
 * 4 - 404: Subcategoria no existe
 * 5 - 500: Error en la base de datos
 */

exports.createProduct = async (req, res) => {
    try {

        const { name, description, price, stock, category, subcategory } = req.body;

        // ============= VALIDACIONES =============

        // Validar que todos los campos requeridos esten presentes
        if (!name || !description || !price || !stock || !category || !subcategory ) {

            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios',
                requiredFields: ['name', 'description', 'price', 'stock', 'category', 'subcategory']
            });
        }

        // Validar que la categoria existe
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'La categoria padre no existe',
                categoryId: category
            });
        }

        // Validar que la subcategoria existe y pertenece a la categoria especificada
        const subcategoryExists = await Subcategory.findOne({
            _id: subcategory,
            category: category
        });

        if (!subcategoryExists) {
            return res.status(400).json({
                success: false,
                message: 'La subactegoria no existe o no pertence a la categoria especificada'
            });
        }

        // ========= CREAR PRODUCTO =========
        const product = new Product({
            name,
            description,
            price,
            stock,
            category,
            subcategory,
        });

        // Si hay usuario autenticado, registrar quien creo el producto
        if (req.user && req.user_id) {
            product.createBy = req.user_id;
        }

        // Guardar el producto en la base de datos
        const savedProduct = await product.save();

        // Obtener el producto poblado con datos de relaciones (populate)
        const productWithDetails = await Product.findById(savedProduct._id)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .populate('createdBy', 'username email');

        return res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: productWithDetails
        });

    } catch (error) {
        console.error('Error en createProduct', error);

        // Manejar error de duplicado (campo único)
        if (error.code === 11000){
            return res.status(400).json({
                success: false,
                message: 'Ya existe un producto con ese nombre'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        });
    } 
};

/**
 * READ: Obtener productos (con filtro de activos/inactivos)
 * GET /api/products
 * Query params:
 * - includeInactive = true : Mostrarta tambien productos desactivados
 * - Default: solo productos activos (ative = true)
 * Retorna:
 * 1 - 200: Array de productos poblados con categoria y subcategoria
 * 2 - 500: Error en el servidor
 */

exports.getProducts = async (req, res) => {
    try {

        // Determinar si incluir productos inactivos
        const includeInactive = req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : { active: { $ne: false } };

        // Obtener productos con datos relacionados (populate)
        const products = await Product.find(activeFilter)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 }); // Ordenar por fecha de creación descendente
            
        // Si el usuario es Auxiliar, no mostrar información de quién lo creó
        if (req.user && req.user.role === 'auxiliar') {

            // Ocultar campo createdBy para usuarios auxiliares
            products.forEach(product => {
                product.createdBy = undefined;
            });

        }

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error('Error en getProducts', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos',
            error: error.message
        });
    }
};

/**
 * READ: Obtener un producto especificado por ID
 * GET /api/products/:id
 * Retorna: Producto poblado con categoria y subcategoria
 */

exports.getProductById = async (req, res) => {
    try {

        // Obtener el producto por ID con datos relacionados (populate)
        const product = await Product.findById(req.params.id)
            .populate('category', 'name description')
            .populate('subcategory', 'name description');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // ocultar createdBy para usuarios auxiliares
        if (req.user && req.user.role === 'auxiliar') {
            product.createdBy = undefined;
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Error en getProductById', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};

/**
 * UPDATE: Actualizar un producto 
 * PUT /api/products/:id
 * Body: { cualquier campo a actualizar}
 * - Solo actualiza campos enviados
 * - Valida relaciones si se envian category o subcategory
 * Retorna: Producto actualizado 
 */

exports.updateProduct = async (req, res) => {
    try { 
        const { name, description, price, stock, category, subcategory } = req.body;
        const updateData = {};

        // Agregar solo los campos que fueron enviados
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (stock) updateData.stock = stock;
        if (category) updateData.category = category;
        if (subcategory) updateData.subcategory = subcategory;

        // Validar relaciones si se actualizan
        if (category || subcategory) {
            if (category) {
                const categoryExists = await Category.findById(category);
                if (!categoryExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'La categoria solicitada no existe'
                    });    
                }
            }

            if (subcategory) {
                const subcategoryExist = await Subcategory.findOne({
                    _id: subcategory,
                    category: category || updateData.category      
                });

                if (!subcategoryExist) {
                    return res.status(404).json({
                        success: false,
                        message: 'La subcategoria no existe o no pertenece a la categoria'
                    });
                }
            }
        }
        
        // Validar producto en BD
        const updateProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { 
            new: true,
            runValidators: true 
        }).populate('category', 'name')
            .populate('subcategory', 'name')
            .populate('createdBy', 'username email');
        
        if (!updateProduct) {
            return res.status(400).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: updateProduct
        });

    } catch (error) {
        console.error('Error en updateProduct', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

/** 
 * DELETE: Eliminar o desactivar un producto
 * DELETE /api/products/:id
 * Query params:
 * - hardDelete = true : Eliminar permanentemente de la base de datos
 * - Default: Soft delete (marcar como inactivo)
 * SOFT DELETE: Solo marcar active: false
 * HARD DELETE: Elimina permanentemente el documento
 */

exports.deleteProduct = async (req, res) => {
    try {

        const isHardDelete = req.query.hardDelete === 'true'
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        if (isHardDelete) {

            // ==== HARD DELETE: Eliminar permenentemente de la base de datos ====
            await Product.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Producto eliminado permanentemente de la base de datos',
                data: product
            });

        } else {

            // ==== SOFT DELETE: Solo marcar como inactivo ====
            product.active = false;
            await product.save();
            res.status(200).json({
                success: true,
                message: 'Producto desactivado exitosamente (soft delete)',
                data: product
            });
        }

    } catch (error) {
        console.error('Error en deleteProduct', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};