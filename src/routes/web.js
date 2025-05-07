import { Router } from 'express';
import { 
  actualizar,
  consulta, 
  consulta_individual, 
  insercion, 
  eliminar, 
  registro_usuario,
  iniciar_sesion
} from "../controllers/Usuarios.controller.js";


const usuariosRouter = Router(); 

usuariosRouter.get("/", consulta);
usuariosRouter.get("/usuario/:nombre", consulta_individual);
usuariosRouter.post("/insercion", insercion);
usuariosRouter.put("/actualizar/:usuario", actualizar);
usuariosRouter.delete("/eliminar/:usuario", eliminar);
usuariosRouter.post("/registro",registro_usuario);
usuariosRouter.post("/login",iniciar_sesion);
export default usuariosRouter;