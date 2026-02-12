/** 
 * Modelo de subcategoria MONGODB
 * Define la estructura de la subcategoria 
 * la subcategoria depende de una categoria
 * muchos productos pueden pertenecer a una subcategoria
 * Muchas subcategorias dependen de una sola categoria
 */

const mongoose=require('mongoose');

//Campos de la tabla subcategoria 

const subcategorySchema = new mongoose.Schema({
  //Nombre de la subcategoria unico y requerido
  name:{
    type: String,
    required: [true, 'el nombre es obligatorio'],
    unique: true,// no pueden haber dos subcategorias con el mismo nombre
    trim: true //elimina espacios en blanco al inicio y al final
  },

  // Descripcion dela subcategoria - requerida 
  descripcion:{
    type: String,
    required:[true, 'la descripcion es requerida'],
    trim: true //Elimina espacios 
  },

  // categoria padre esta subcategoria pertenece a una categoria 
  //relacion 1 - muchos una categoria puede tener muchas subcategorias

  category: {
    type: mongoose.Schema.Type.ObjectId,
    ref: 'category', //puede ser poblado con .populate ('category)
    required: [true, 'la categoria es requerida']
  },

  //Activa y desactivala categoria pero no la elimina
  active: {
    type: String,
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
      next(new Error('ya existe una subcategoria con ese nombre'));

    } else {
        //pasar el error tal como es
      next(error);

      }
      
});

/**
 * crear indice unico
 * 
 * Mongo rechazara cualquier intentyo de insertar un documento con un valor de name que ya exista
 * aumentar la velocidad de las busquedas 
 */



//Exportar el modelo 
module.exports = mongoose.model('Subcategory', subcategorySchema);