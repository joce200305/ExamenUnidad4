import Usuarios from "../models/Usuarios.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const registro_usuario = async (recibido, respuesta) => {
    try{
        const { nombre, usuario, password, rol } = recibido.body;
        const cifrado = await bcrypt.hash(password, 10);
        const registro = new Usuarios({
            "nombre": nombre,
            "usuario": usuario,
            "password": cifrado,
            "rol": rol,
            "estado": "inactivo"
        });
        await registro.save();
        respuesta.status(201).json({"msj":"Usuario registrado","registro":registro});

    }catch(error){
        respuesta.status(500).json({"msj":error});  
    }
}
const iniciar_sesion = async (recibido, respuesta) => {
    try {
        const { usuario, password } = recibido.body;
        const consultaUsuario = await Usuarios.findOne({ "usuario": usuario });

        if (!consultaUsuario) return respuesta.status(401).json({ "msj": `El usuario ${usuario} no está registrado` });

        let comparacion = await bcrypt.compare(password, consultaUsuario.password);

        if (!comparacion) return respuesta.status(401).json({ "msj": "Credenciales de acceso no válidas" });
        const token = jwt.sign(
            {
                id:consultaUsuario.id
                ,rol:consultaUsuario.rol,
            }, 
            process.env.JWT_SECRET,{
                "expiresIn":"1hr"
            }
        );
        respuesta.status(200).json({ "msj": "Inicio de sesión exitoso", "token":token});
    } catch (error) {
        console.error(error);
        respuesta.status(500).json({ "msj": "Error en el servidor" });
    }
}


const consulta = async(recibido, respuesta) => {
    try {
        const usuarios = await Usuarios.find();
        respuesta.json(usuarios)
    } catch (error) {
        respuesta.status(500).json({"error": error.message})
    }
}

const consulta_individual = async (recibido, respuesta) => {
    try {
        let usuario = recibido.params.usuario;
        const usuarioEncontrado = await Usuarios.findOne({ "usuario": usuario });
        
        if (!usuarioEncontrado) {
            return respuesta.status(404).json({ "error":"El usuario no existe" });
        }
        
        respuesta.json(usuarioEncontrado);
    } catch (error) {
        respuesta.status(500).json({ "error": error.message });
    }
}

const insercion = async(recibido, respuesta) => {
    try {
        const {nombre, usuario, password, rol, estado} = recibido.body;
        
        if (!nombre || !usuario || !password || !rol) {
            return respuesta.status(400).json({"error": "Debes llenar los campos obligatorios: nombre, usuario, password y rol"});
        }
        
        // Validar que el rol sea un número
        if (isNaN(rol)) {
            return respuesta.status(400).json({"error": "El rol debe ser un número"});
        }
        
        // Estado por defecto si no se envía
        const estadoFinal = estado || 'activo';
        
        const existeUsuario = await Usuarios.findOne({ $or: [{nombre}, {usuario}] });
        if (existeUsuario) {
            return respuesta.status(400).json({"error": "Ya existe un usuario con ese nombre o nombre de usuario"});
        }
        
        const usuarioNuevo = new Usuarios({
            nombre, 
            usuario, 
            password, 
            rol, 
            estado: estadoFinal
        });
        
        await usuarioNuevo.save();
        respuesta.status(201).json(usuarioNuevo);
    } catch (error) {
        respuesta.status(500).json({"error": error.message});
    }
}

const actualizar = async (recibido, respuesta) => {
    try {
        const { nombre, usuario, password, rol, estado } = recibido.body;
        let user = recibido.params.usuario;
        
        if (!nombre || !usuario || !password || !rol) {
            return respuesta.status(400).json({"error": "Todos los campos obligatorios son requeridos"});
        }
        
        if (isNaN(rol)) {
            return respuesta.status(400).json({"error": "El rol debe ser un número"});
        }
        
        const usuarioExistente = await Usuarios.findOne({ "usuario": user });
        
        if (!usuarioExistente) {
            const estadoFinal = estado || 'activo';
            const usuarioNuevo = new Usuarios({
                nombre, 
                usuario, 
                password, 
                rol, 
                estado: estadoFinal
            });
            await usuarioNuevo.save();
            return respuesta.status(201).json({
                "msj": "Usuario no existe, pero se creará uno nuevo", 
                "usuario": usuarioNuevo
            });
        }
        
        const existeUsuario = await Usuarios.findOne({ 
            $and: [
                { _id: { $ne: usuarioExistente._id } }, 
                { $or: [{nombre}, {usuario}] }
            ] 
        });
        
        if (existeUsuario) {
            return respuesta.status(400).json({
                "error": "Ya existe otro usuario con ese nombre o nombre de usuario"
            });
        }
        
        await Usuarios.updateOne(
            { "usuario": user }, 
            { 
                $set: { 
                    "nombre": nombre, 
                    "usuario": usuario, 
                    "password": password, 
                    "rol": rol, 
                    "estado": estado || usuarioExistente.estado 
                } 
            }
        );
        
        respuesta.status(200).json({ "msj": "Actualización correcta!" });
    } catch (error) {   
        respuesta.status(500).json({ "error": error.message });
    }
};

const eliminar = async (recibido, respuesta) => {
    try {
        let usuario = recibido.params.usuario;
        const usuarioExistente = await Usuarios.findOne({ "usuario": usuario });
        
        if (!usuarioExistente) {
            return respuesta.status(404).json({"error": "El usuario no existe"});
        }
        
        await Usuarios.deleteOne({"usuario": usuario});
        respuesta.status(200).json({"msj": "Usuario eliminado correctamente!"});
    } catch (error) {
        respuesta.status(500).json({"error": error.message});
    }
}


export { registro_usuario, iniciar_sesion, consulta, consulta_individual, insercion, actualizar, eliminar };