import mongoose from "mongoose";

const peliculaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    director: { type: String, required: true },
    estreno: { type: Number, required: true },
    genero: { type: String, required: true },
    duracion: { type: Number, required: true },
    calificacion: { type: Number, required: true },
    imagen: { type: String, default: "" }
});

const PeliculaAventura = mongoose.model(
    'PeliculaAventura', 
    peliculaSchema, 
    'peliculas_aventura' 
);

const PeliculaInfantil = mongoose.model(
    'PeliculaInfantil', 
    peliculaSchema, 
    'peliculas_infantiles'
);

const PeliculaPopular = mongoose.model(
    'PeliculaPopular', 
    peliculaSchema, 
    'peliculas_populares'
);

export {peliculaSchema, PeliculaAventura, PeliculaInfantil, PeliculaPopular };