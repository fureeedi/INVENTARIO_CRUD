/** 
 * Modelo de producto MONGODB
 * Define la estructura deL producto
 * El poducto depende de una subcategoria depende de una categoria
 * La subcategoria depende de una categoria
 * Muchos productos pueden pertenecer a una subcategoria
 * Tiene relacion un user para ver quien creo o modifico el producto
 * 
 */

const mongoose = require('mongoose');
 
//Campos de la tabla producto 

const productSchema = new mongoose.Schema({
  //Nombre del producto unico y requerido
  name:{
    type: String, // permite caracter especial
    required: [true, 'el nombre es obligatorio'],
    unique: true,// no pueden haber dos productos con el mismo nombre - indice unico en Mongo
    trim: true // elimina espacios en blanco al inicio y al final 
  },

  // Descripcion del producto - requerida 
  descripcion:{
    type: String,
    required:[true, 'la descripcion es requerida'],
    trim: true //Elimina espacios al inicio y final
  },

  // precio en unidades monetarias
  // no puede ser negativo
  price:{
    type: Number,
    required:[true, 'la precio es obligatorio'],
    min: [0, 'el precio no puede ser negativo'] // validación - rechaza valores inferiores a cero - en Mongo
  },

  // cantidad de stock
  // no puede ser negativa
  stock:{
    type: Number,
    required:[true, 'la stock es obligatorio'],
    min: [0, 'el stock no puede ser negativo'] // validación - rechaza valores inferiores a cero - en Mongo
  },

  // categoria padre esta subcategoria pertenece a una categoria 
  // relacion 1 - muchos una categoria puede tener muchas subcategorias
  // Un producto pertenece a una categoria pero una subcategoria puede tener muchos productos relacion 1 a muchos

  category: {
    type: mongoose.Schema.Types.ObjectId, //tipo especial - referencia documentos - consultar en otra colección por id y que lo use
    ref: 'category', // puede ser poblado con .populate ('category) - documento de modelo
    required: [true, 'la categoria es requerida']
  },

  subcategory: {
    type: mongoose.Schema.Types.ObjectId, // tipo especial - referencia documentos - consultar en otra colección por id y que lo use
    ref: 'subcategory', //puede ser poblado con .populate ('subcategory)
    required: [true, 'la subcategoria es requerida']
  },

  //quien creo el producto
  //Referencia de User no requerido
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // puede ser poblado para mostrar los usuarios
  },

  // Array de urls de imagenes del productos
  images: [{
    type: String, //url de la imagen
  }],

  //Active y desactiva la categoria pero no la elimina
  active: {
    type: Boolean,
    default: true
  }

},{
  timestamps: true, //agregar createdAt y updateAT automaticamente
  versionKey: false, // No incluir campos _v - no guarda directamente - guarda directamente en el cache de mongo - al llamar no trae los datos
});

/**
 * MIDDLEWARE PRE-SAVE
 * Limpia indices duplicados
 * Mongodb a veces crear multiples indices con el mismo nombre 
 * esti causa conflictos al intentar dropIndex o recrear indices
 * este middleware limpia los indices problematicos 
 * proceso
 * 1 obtiene una lista de todos los indices de la coleccion 
* 2 busca si existe indice con nombre de name_1 (antiguo o duplicado)
*si existe lo elimina antes de nuevas operaciones 
ignora errrores si el indice mo exite 
continua con lel guardado normal
 */
productSchema.post('save', function(error,doc,next) {

  // verificar si el error de mongoDB por violacion fr indice unico - que el campo sea unico
  if (error.name === 'MongoServerError' && error.code === 11000) {
      return next(new Error('ya existe un producto con ese nombre'))
    } 

    //pasar el error tal como es
    next(error);
});

/**
 * crear indice unico
 * 
 * Mongo rechazara cualquier intentyo de insertar un documento con un valor de name que ya exista
 * aumentar la velocidad de las busquedas 
 */



//Exportar el modelo - exporta directamente a los controladores
module.exports = mongoose.model('Product', productSchema);
