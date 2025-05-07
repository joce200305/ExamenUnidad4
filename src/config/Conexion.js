import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const Conexion=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
            maxPoolSize:10, //determina el numero maximo de conexiones
            minPoolSize:5
        })
        console.log('Conectado a MongoDB con Pooling')
    } catch(error){
        console.error('Error en la conexion a mongoDB:',error.message);
        process.exit(1);
    }
};
export default Conexion;