/** 
 * Modelo de subcategoria MONGODB
 * Define la estructura de la subcategoria 
 * el poducto depende de una subcategoria depende de una categoria
 * la subcategoria depende de una categoria
 * muchos productos pueden pertenecer a una subcategoria
 * tiene relacion un user para ver quien creo o modifico la subcategoria
 * Muchas subcategorias dependen de una sola categoria
 */

const mongoose=require('mongoose');

//Campos de la tabla producto 

const productSchema = new mongoose.Schema({
  //Nombre del producto unico y requerido
  name:{
    type: String,
    required: [true, 'el nombre es obligatorio'],
    unique: true,// no pueden haber dos productos con el mismo nombre
    trim: true //Elimina espacios en blanco al inicio y al final
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
    min: [0, 'el precio no puede ser negativo']
  },

    // cantidad de stock
    // no puede ser negativa
  stock:{
    type: Number,
    required:[true, 'la stock es obligatorio'],
    min: [0, 'el stock no puede ser negativo']
  },

  // categoria padre esta subcategoria pertenece a una categoria 
  //relacion 1 - muchos una categoria puede tener muchas subcategorias
  // Un producto pertenece a una categoria pero una subcategoria puede tener muchos productos relacion 1 a muchos

  category: {
    type: mongoose.Schema.Type.ObjectId,
    ref: 'category', //puede ser poblado con .populate ('category)
    required: [true, 'la categoria es requerida']
  },

    subcategory: {
    type: mongoose.Schema.Type.ObjectId,
    ref: 'subcategory', //puede ser poblado con .populate ('subcategory)
    required: [true, 'la subcategoria es requerida']
  },

  //quien creo el producto
  //Referencia de User no requerido
  createBy: {
    type: mongoose.Schema.Type.ObjectId,
    ref: 'User' // puede ser poblado con mostrar los usuarios
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
 versionKey: false, //No incluir campos _v 
});
/**
 * MIDDLEWARE PRE SAVE
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
subcategorySchema.post('save', function(error,doc,next) {
  // verificar si el error de mongoDB por violacion fr indice univo
  if (error.name === 'MongoServerError' && error.code === 1000) {
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



//Exportar el modelo 
module.exports = mongoose.model('Product', productSchema);
