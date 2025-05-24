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
        enum: [1, 2], 
        default: 2
    },
    estado: {
        type: String,
        enum: ["activo", "inactivo", "deshabilitado"],
        default: "inactivo"
    }
}, {
    
});


export default mongoose.model('Usuarios', UsuarioModelo);