import Usuarios from "../models/Usuarios.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

const verificarTokenPersonalizado = (req) => {
    const authHeader = req.headers.autorizacion;
    
    if (!authHeader) throw new Error('No se proporcionó header de autorización');
    if (!authHeader.startsWith('Back ')) throw new Error('Formato de autorización incorrecto');
    
    const token = authHeader.split(' ')[1];
    if (!token) throw new Error('Token no proporcionado');

    return jwt.verify(token, process.env.JWT_SECRET);
};

const consulta = async(req, res) => {
    try {
        const usuarios = await Usuarios.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({"error": error.message});
    }
};

const consulta_individual = async (req, res) => {
    try {
        const nombre = req.params.nombre;
        const usuario = await Usuarios.findOne({ nombre });
        
        if (!usuario) {
            return res.status(404).json({ "error": "El usuario no existe" });
        }
        
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
};

const insercion = async(req, res) => {
    try {
        const { nombre, usuario, password, rol, estado } = req.body;
        
        if (!nombre || !usuario || !password || !rol) {
            return res.status(400).json({"error": "Debes llenar los campos obligatorios"});
        }
        
        const existeUsuario = await Usuarios.findOne({ $or: [{nombre}, {usuario}] });
        if (existeUsuario) {
            return res.status(400).json({"error": "Ya existe un usuario con ese nombre o usuario"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const usuarioNuevo = new Usuarios({
            nombre, 
            usuario, 
            password: hashedPassword,
            rol, 
            estado: estado || 'inactivo'
        });
        
        await usuarioNuevo.save();
        res.status(201).json(usuarioNuevo);
    } catch (error) {
        res.status(500).json({"error": error.message});
    }
};

const actualizar = async (req, res) => {
  try {
      const { nombre, usuario, password, rol, estado } = req.body;
      const id = req.params.id;
      
      if (!nombre || !usuario || !rol) {
          return res.status(400).json({"error": "Nombre, usuario y rol son obligatorios"});
      }
      
      const usuarioExistente = await Usuarios.findById(id);
      
      if (!usuarioExistente) {
          return res.status(404).json({"error": "Usuario no encontrado"});
      }
      
      const updateData = { 
          nombre, 
          usuario, 
          rol,
          estado: estado || usuarioExistente.estado // Mantiene el estado actual si no se proporciona uno nuevo
      };
      
      if (password) {
          updateData.password = await bcrypt.hash(password, 10);
      }
      
      const usuarioActualizado = await Usuarios.findByIdAndUpdate(
          id, 
          { $set: updateData },
          { new: true }
      ).select('-password');
      
      res.status(200).json({ 
          "msj": "Actualización correcta!",
          "usuario": usuarioActualizado
      });
  } catch (error) {   
      res.status(500).json({ "error": error.message });
  }
};


const eliminar = async (req, res) => {
    try {
        const id = req.params.id;
        const usuarioExistente = await Usuarios.findById(id);
        
        if (!usuarioExistente) {
            return res.status(404).json({"error": "El usuario no existe"});
        }
        
        await Usuarios.findByIdAndDelete(id);
        res.status(200).json({"msj": "Usuario eliminado correctamente!"});
    } catch (error) {
        res.status(500).json({"error": error.message});
    }
};

const registro_usuario = async (req, res) => {
    try {
        const { nombre, usuario, password } = req.body;
        
        if (!nombre || !usuario || !password) {
            return res.status(400).json({"error": "Todos los campos son obligatorios"});
        }
        
        const existeUsuario = await Usuarios.findOne({ usuario });
        if (existeUsuario) {
            return res.status(400).json({"error": "El usuario ya está registrado"});
        }
        
        const cifrado = await bcrypt.hash(password, 10);
        const registro = new Usuarios({
            nombre,
            usuario,
            password: cifrado,
            rol: 2,
            estado: "inactivo"
        });
        
        await registro.save();
        res.status(201).json({
            "msj": "Registro exitoso. Ya puedes iniciar sesión.",
            "registro": {
                nombre: registro.nombre,
                usuario: registro.usuario,
                rol: registro.rol,
                estado: registro.estado
            }
        });
    } catch(error) {
        res.status(500).json({"error": error.message});  
    }
};

const iniciar_sesion = async (req, res) => {
    try {
        const { usuario, password } = req.body;
        const usuarioEncontrado = await Usuarios.findOne({ usuario });

        if (!usuarioEncontrado) {
            return res.status(401).json({ "msj": `El usuario ${usuario} no está registrado` });
        }

        if (usuarioEncontrado.estado === 'deshabilitado') {
            return res.status(403).json({ 
                "msj": "Tu cuenta ha sido deshabilitada. Contacta al administrador." 
            });
        }

        const valido = await bcrypt.compare(password, usuarioEncontrado.password);
        if (!valido) {
            return res.status(401).json({ "msj": "Credenciales inválidas" });
        }
        
        if (usuarioEncontrado.estado !== 'deshabilitado') {
            await Usuarios.findByIdAndUpdate(usuarioEncontrado._id, { estado: "activo" });
        }

        const token = jwt.sign(
            { id: usuarioEncontrado.id, rol: usuarioEncontrado.rol }, 
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        
        res.status(200).json({ 
            "msj": "Inicio de sesión exitoso", 
            "token": token,
            "usuario": usuarioEncontrado.usuario,
            "rol": usuarioEncontrado.rol,
            "nombre": usuarioEncontrado.nombre
        });
    } catch (error) {
        res.status(500).json({ "msj": "Error en el servidor" });
    }
};

const cerrar_sesion = async (req, res) => {
  try {
    const { usuario } = req.params;
    const usuarioEncontrado = await Usuarios.findOne({ usuario });

    if (!usuarioEncontrado) {
      return res.status(404).json({ "msj": "Usuario no encontrado" });
    }

    
    if (usuarioEncontrado.estado !== 'deshabilitado') {
      await Usuarios.findByIdAndUpdate(usuarioEncontrado._id, { estado: "inactivo" });
    }

    res.status(200).json({ "msj": "Sesión cerrada correctamente" });
  } catch (error) {
    res.status(500).json({ "msj": "Error en el servidor" });
  }
};
const listarUsuariosParaAdmin = async (req, res) => {
    try {
        const decoded = verificarTokenPersonalizado(req);
        
        if (decoded.rol !== 1) {
            return res.status(403).json({ error: "Se requieren privilegios de administrador" });
        }

        const usuarios = await Usuarios.find({}, { password: 0 });
        res.status(200).json(usuarios);
    } catch (error) {
        if (error.message.includes('Formato de autorización incorrecto') || 
            error.message.includes('No se proporcionó')) {
            return res.status(401).json({ error: error.message });
        }
        res.status(500).json({ error: "Error del servidor" });
    }
};

const cambiarEstadoUsuario = async (req, res) => {
    try {
        const decoded = verificarTokenPersonalizado(req);
        if (decoded.rol !== 1) {
            return res.status(403).json({ error: "Se requieren privilegios de administrador" });
        }

        const { usuario } = req.params;
        const { estado } = req.body;

        if (!["inactivo", "deshabilitado"].includes(estado)) {
            return res.status(400).json({ error: "Estado no válido" });
        }

        const usuarioEncontrado = await Usuarios.findOne({ usuario });
        if (!usuarioEncontrado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const usuarioActualizado = await Usuarios.findOneAndUpdate(
            { usuario },
            { estado },
            { new: true }
        ).select('-password');

        res.status(200).json({
            msj: `Estado actualizado a: ${estado}`,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.error("Error en cambiarEstadoUsuario:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
};
export { 
    consulta, 
    consulta_individual, 
    insercion, 
    actualizar, 
    eliminar,
    registro_usuario,
    iniciar_sesion,
    cerrar_sesion,
    listarUsuariosParaAdmin,
    cambiarEstadoUsuario
};