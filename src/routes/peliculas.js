import { Router } from 'express';
import { 
    obtenerPeliculas, 
    obtenerPeliculaPorTitulo, 
    crearPelicula, 
    actualizarPelicula, 
    eliminarPelicula 
} from "../controllers/Peliculas.controller.js";
import authMiddleware from '../config/authMiddleware.js';

const peliculasRouter = (tipo) => {
    const router = Router();

    router.get('/', (req, res) => obtenerPeliculas(req, res, tipo));
    router.get('/:titulo', (req, res) => obtenerPeliculaPorTitulo(req, res, tipo));
    router.post('/',authMiddleware, (req, res) => crearPelicula(req, res, tipo));
    router.put('/:titulo',authMiddleware, (req, res) => actualizarPelicula(req, res, tipo));
    router.delete('/:titulo',authMiddleware, (req, res) => eliminarPelicula(req, res, tipo));

    return router;
};

export default peliculasRouter;