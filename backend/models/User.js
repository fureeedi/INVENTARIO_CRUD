//modelo de usuario
/*define la estructura de base de datos para los usuarios, encripta la contraseña manejo de roles(admin,coordinador  y auxiliar)*/
const mongoose = require('mongoose');
const bcrypt= require('bcryptjs');

//estructura de la base de datos para los usuarios
const userSchema= new mongoose.Schema({

//le nombre de lusuario debe ser unico en toda base de datos 
username:{
    type: String,
    required: true,
    unique: true,
    trim: true // elimina espacios en blanco al inicio y al final 
},

//Email deber ser unico valiudo en minisculas

email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true, // convierte el email a minisculas
    trim: true,
    match: [/\S+@\S+\.\S+/, 'El correo no es válido'] // valida el fpatron del email
},
// contraseña - requerida, minimo 6 caracteres
password:{
    type: String,
    required: true,
    minlength: 6,
    select: false //no incluir en resultados por defecto// para que no creee autorellenar la contraseña
},
// rol de usuario restinge valores especificos 
role: {
        type: String,
        enum: ['admin', 'coordinador', 'auxiliar'], //solo estos valores sn permitidos
        default: 'auxiliar' // rol por defecto, los nuevos suarios osn auxiliares 
},
// usuarios activos 
active : {
    type: Boolean,
    default: true // nuevos usuarios comienzan activos
    },
},{ 
    timestamps: true, // agregar createdAt y updatedAt automaticamente
    versionKey:false //no incluir __v en el control de versiones de mongoose //tiempo de creado y modificado automaticamente
});

//middleware encripta la contraeña antes de guardar el usuario 
userSchema.pre('save', async function(next){
    // si el 'password no fue modificado no encripta de nuevo 
    if(!this.isModified('password')) return next();

    try{
        // genera un salt con complejidad de 10 rondas 
        //mayor numero de rondas = mas seguro pero mas lento el proceso de encriptacion
        const salt = await bcrypt.genSalt(10);
        // encripta la contraseña usando el salt generado
        this.password = await bcrypt.hash(this.password, salt);
        next(); // continuar con el proceso de guardado
    } catch (error) {
        // si hay un error, pasa el error al siguiente middleware
        next(error); 
    }
});

//crear y exportar el modulo de usario 
module.exports = mongoose.model('User', userSchema);