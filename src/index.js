import express from 'express';
import cors from 'cors';
import usuariosRouter from './routes/web.js';
import peliculasRouter from './routes/peliculas.js';
import Conexion from './config/Conexion.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(process.cwd(), 'uploads');

const app = express();

app.use(express.json());
app.use(cors());

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Directorio uploads creado en: ${uploadsDir}`);
}

app.use('/uploads', express.static(uploadsDir));

Conexion();

app.use("/peliculas_aventura", peliculasRouter('aventura'));
app.use("/peliculas_infantiles", peliculasRouter('infantil'));
app.use("/peliculas_populares", peliculasRouter('popular'));
app.use("/peliculas", peliculasRouter());
app.use("/usuarios", usuariosRouter);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        estatus: "error",
        mensaje: "Ruta no encontrada"
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Archivos estáticos en: ${uploadsDir}`);
});