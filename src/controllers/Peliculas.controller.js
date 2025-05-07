import { PeliculaAventura, PeliculaInfantil, PeliculaPopular } from "../models/Pelicula.js";

const obtenerPeliculas = async (req, res, tipoEspecifico) => {
    try {
        let peliculas;
        
        if (tipoEspecifico) {
            switch(tipoEspecifico) {
                case 'aventura':
                    peliculas = await PeliculaAventura.find();
                    break;
                case 'infantil':
                    peliculas = await PeliculaInfantil.find();
                    break;
                case 'popular':
                    peliculas = await PeliculaPopular.find();
                    break;
                default:
                    return res.status(400).json({
                        error: "Tipo no válido",
                        mensaje: "El tipo debe ser 'aventura', 'infantil' o 'popular'"
                    });
            }
        } else {
            const { tipo } = req.query;
            
            if (tipo) {
                switch(tipo) {
                    case 'aventura':
                        peliculas = await PeliculaAventura.find();
                        break;
                    case 'infantil':
                        peliculas = await PeliculaInfantil.find();
                        break;
                    case 'popular':
                        peliculas = await PeliculaPopular.find();
                        break;
                    default:
                        return res.status(400).json({
                            error: "Tipo no válido",
                            mensaje: "El tipo debe ser 'aventura', 'infantil' o 'popular'"
                        });
                }
            } else {
                const [aventuras, infantiles, populares] = await Promise.all([
                    PeliculaAventura.find(),
                    PeliculaInfantil.find(),
                    PeliculaPopular.find()
                ]);
                peliculas = {
                    aventuras,
                    infantiles,
                    populares
                };
            }
        }
        
        res.json(peliculas);
    } catch (error) {
        res.status(500).json({
            error: "Error al obtener películas",
            detalle: error.message
        });
    }
}

const obtenerPeliculaPorTitulo = async (req, res, tipoEspecifico) => {
    try {
        const { titulo } = req.params;
        
        let pelicula;
        
        if (tipoEspecifico) {
            switch(tipoEspecifico) {
                case 'aventura':
                    pelicula = await PeliculaAventura.findOne({ titulo });
                    break;
                case 'infantil':
                    pelicula = await PeliculaInfantil.findOne({ titulo });
                    break;
                case 'popular':
                    pelicula = await PeliculaPopular.findOne({ titulo });
                    break;
            }
        } else {
            const [aventura, infantil, popular] = await Promise.all([
                PeliculaAventura.findOne({ titulo }),
                PeliculaInfantil.findOne({ titulo }),
                PeliculaPopular.findOne({ titulo })
            ]);
            
            pelicula = aventura || infantil || popular;
        }
        
        if (!pelicula) {
            return res.status(404).json({ 
                error: "Película no encontrada",
                mensaje: `No existe una película con el título '${titulo}'`
            });
        }
        
        res.json(pelicula);
    } catch (error) {
        res.status(500).json({
            error: "Error al buscar película",
            detalle: error.message
        });
    }
}

const crearPelicula = async (req, res, tipoEspecifico) => {
    if(req.user.rol!==1) return res.status(500).json({"msj":"no tienes permisos para efectuar esta accion"});

    try {
        const { titulo, director, estreno, genero, duracion, calificacion } = req.body;
        
        const tipo = tipoEspecifico || req.body.tipo;
        
        const camposRequeridos = { titulo, director, estreno, genero, duracion, calificacion };
        const camposFaltantes = Object.entries(camposRequeridos)
            .filter(([_, valor]) => !valor)
            .map(([nombre]) => nombre);
            
        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                error: "Campos requeridos faltantes",
                camposFaltantes,
                mensaje: "Todos los campos son obligatorios"
            });
        }
        
        if (!tipo) {
            return res.status(400).json({
                error: "Tipo no especificado",
                mensaje: "Debe especificar el tipo de película"
            });
        }
        
        const [aventura, infantil, popular] = await Promise.all([
            PeliculaAventura.findOne({ titulo }),
            PeliculaInfantil.findOne({ titulo }),
            PeliculaPopular.findOne({ titulo })
        ]);
        
        if (aventura || infantil || popular) {
            return res.status(400).json({
                error: "Película ya existe",
                mensaje: `Ya existe una película con el título '${titulo}'`
            });
        }
        
        let nuevaPelicula;
        switch(tipo) {
            case 'aventura':
                nuevaPelicula = new PeliculaAventura({
                    titulo, director, estreno, genero, duracion, calificacion
                });
                break;
            case 'infantil':
                nuevaPelicula = new PeliculaInfantil({
                    titulo, director, estreno, genero, duracion, calificacion
                });
                break;
            case 'popular':
                nuevaPelicula = new PeliculaPopular({
                    titulo, director, estreno, genero, duracion, calificacion
                });
                break;
            default:
                return res.status(400).json({
                    error: "Tipo no válido",
                    mensaje: "El tipo debe ser 'aventura', 'infantil' o 'popular'"
                });
        }
        
        await nuevaPelicula.save();
        
        res.status(201).json({
            success: true,
            mensaje: "Película creada exitosamente",
            pelicula: nuevaPelicula
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al crear película",
            detalle: error.message
        });
    }
}

const actualizarPelicula = async (req, res, tipoEspecifico) => {
    if(req.user.rol!==1) return res.status(500).json({"msj":"no tienes permisos para efectuar esta accion"});

    try {
        const { titulo: nuevoTitulo, director, estreno, genero, duracion, calificacion } = req.body;
        const { titulo: tituloOriginal } = req.params;
        
        const tipo = tipoEspecifico || req.body.tipo;
        
        const camposRequeridos = { titulo: nuevoTitulo, director, estreno, genero, duracion, calificacion };
        const camposFaltantes = Object.entries(camposRequeridos)
            .filter(([_, valor]) => !valor)
            .map(([nombre]) => nombre);
            
        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                error: "Campos requeridos faltantes",
                camposFaltantes,
                mensaje: "Todos los campos son obligatorios para actualizar"
            });
        }
        
        if (!tipo) {
            return res.status(400).json({
                error: "Tipo no especificado",
                mensaje: "Debe especificar el tipo de película"
            });
        }
        
        let peliculaExistente;
        switch(tipo) {
            case 'aventura':
                peliculaExistente = await PeliculaAventura.findOne({ titulo: tituloOriginal });
                break;
            case 'infantil':
                peliculaExistente = await PeliculaInfantil.findOne({ titulo: tituloOriginal });
                break;
            case 'popular':
                peliculaExistente = await PeliculaPopular.findOne({ titulo: tituloOriginal });
                break;
        }
        
        if (!peliculaExistente) {
            return res.status(404).json({
                error: "Película no encontrada",
                mensaje: `No existe una película con el título '${tituloOriginal}' en la colección '${tipo}'`
            });
        }
        
        if (nuevoTitulo !== tituloOriginal) {
            const [aventura, infantil, popular] = await Promise.all([
                PeliculaAventura.findOne({ titulo: nuevoTitulo }),
                PeliculaInfantil.findOne({ titulo: nuevoTitulo }),
                PeliculaPopular.findOne({ titulo: nuevoTitulo })
            ]);
            
            if (aventura || infantil || popular) {
                return res.status(400).json({
                    error: "Título ya existe",
                    mensaje: `Ya existe una película con el título '${nuevoTitulo}'`
                });
            }
        }
        
        let modelo;
        switch(tipo) {
            case 'aventura': modelo = PeliculaAventura; break;
            case 'infantil': modelo = PeliculaInfantil; break;
            case 'popular': modelo = PeliculaPopular; break;
        }
        
        const peliculaActualizada = await modelo.findOneAndUpdate(
            { titulo: tituloOriginal },
            { 
                titulo: nuevoTitulo,
                director,
                estreno,
                genero,
                duracion,
                calificacion
            },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            mensaje: "Película actualizada exitosamente",
            pelicula: peliculaActualizada
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al actualizar película",
            detalle: error.message
        });
    }
}

const eliminarPelicula = async (req, res, tipoEspecifico) => {
    if(req.user.rol !==1) return res.status(500).json({"msj":"no tienes permisos para efectuar esta accion"});

    try {
        const { titulo } = req.params;
        
        const tipo = tipoEspecifico || req.body.tipo;
        
        if (!tipo) {
            return res.status(400).json({
                error: "Tipo no especificado",
                mensaje: "Debe especificar el tipo de película"
            });
        }
        
        let peliculaExistente;
        switch(tipo) {
            case 'aventura':
                peliculaExistente = await PeliculaAventura.findOne({ titulo });
                break;
            case 'infantil':
                peliculaExistente = await PeliculaInfantil.findOne({ titulo });
                break;
            case 'popular':
                peliculaExistente = await PeliculaPopular.findOne({ titulo });
                break;
        }
        
        if (!peliculaExistente) {
            return res.status(404).json({
                error: "Película no encontrada",
                mensaje: `No existe una película con el título '${titulo}' en la colección '${tipo}'`
            });
        }
        
        switch(tipo) {
            case 'aventura': await PeliculaAventura.deleteOne({ titulo }); break;
            case 'infantil': await PeliculaInfantil.deleteOne({ titulo }); break;
            case 'popular': await PeliculaPopular.deleteOne({ titulo }); break;
        }
        
        res.status(200).json({
            success: true,
            mensaje: "Película eliminada exitosamente",
            peliculaEliminada: peliculaExistente
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al eliminar película",
            detalle: error.message
        });
    }
}

export { 
    obtenerPeliculas, 
    obtenerPeliculaPorTitulo, 
    crearPelicula, 
    actualizarPelicula, 
    eliminarPelicula 
};