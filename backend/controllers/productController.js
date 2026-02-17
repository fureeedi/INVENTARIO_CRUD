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

};