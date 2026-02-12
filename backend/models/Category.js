/** 
 * modelo de categoria MONGODB
 * define la estructura d ela categoria 
 */

const mongoose=require('mongoose');

//campos de la tabla categoria 

const categorySchema = new mongoose.Schema({
  //nombre de la categoria unico y requerido
  name:{
    type: String,
    required: [true, 'el nombre es obligatorio'],
    unique: true,
    trim: true //elimina espacios en blanco al inicio y al final
  },
  // Descripcion dela categoria - requerida 
  descripcion:{
    type: String,
    required:[true, 'la categoria es requerida'],
    trim: true //Elimina espacios 
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
categorySchema.pre('save', async function(next) {
  try{
    //obtener referencia de la collecion de mongoDB
    const collection = this.constructor.collection;

    //obtener lista de todos los indices
    const indexes = await collection.indexes();

    //Buscar si existe indice problematico con nombre "name_1"
    // (del orden: 1 significa ascendente)
    const problematicIndex = indexes.find(index => index.name === 'name_1');
      
    //si lo encuetra, eliminarlo 
      if (problematicIndex){
        await collection.dropIndex('name_1');
      }
  } catch (error) {
    //si el errror es index no found no es problema - continuar
    // si es otro error pasarlo al siguiente middleware 
    if (!error.message.includes('Index no found')) {
      return next(error);
  }
} 
// continuar con el guardado 
  next();
});

/**
 * crear indice unico
 * 
 * Mongo rechazara cualquier intentyo de insertar un documento con un valor de name que ya exista
 * aumentar la velocidad de las busquedas 
 */

categorySchema.index({namr: 1}, {
  unique: true,
  name: 'name_1' // nombre explicito para eitar conflictos

});

//Exportar el modelo 
module.exports = mongoose.model('category', categorySchema)