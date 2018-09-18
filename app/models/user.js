//Instancia de la libreria mongoose para crear el esquema de la base de datos
const mongoose = require('mongoose');
const { Schema } = mongoose;

//Crear la base del modelo de la base de datos
//Se pasa el modelo usando module.exports
module.exports = mongoose.model('User', new Schema({
    name: String,
    password: String,
    admin: Boolean
}));

