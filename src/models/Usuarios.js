import mongoose from "mongoose";

const UsuarioModelo = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    usuario: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    rol: {
        type: Number,
        required: true,
        default: 2 // Por defecto rol de usuario normal (2)
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    }
}, {
});

// Identificador fuera del archivo, instancia de clase apartir de schema
export default mongoose.model('Usuarios', UsuarioModelo);