import express from 'express';
import cors from 'cors';
import usuariosRouter from './routes/web.js';
import peliculasRouter from './routes/peliculas.js';
import Conexion from './config/Conexion.js';

const app = express();

app.use(express.json()); 
app.use(cors()); 

Conexion();

app.use("/peliculas_aventura", peliculasRouter('aventura'));
app.use("/peliculas_infantiles", peliculasRouter('infantil'));
app.use("/peliculas_populares", peliculasRouter('popular'));
app.use("/peliculas", peliculasRouter()); 
app.use("/usuarios", usuariosRouter);




app.use((req, res) => {
    res.status(404).json({
        estatus: "error",
        msj: "ruta no encontrada"
    });
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
