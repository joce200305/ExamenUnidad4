import { Router } from 'express';
import { 
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
} from "../controllers/Usuarios.controller.js";

const router = Router();

router.post("/registro", registro_usuario);
router.post("/login", iniciar_sesion);

router.get("/", consulta);
router.get("/usuario/:nombre", consulta_individual);
router.post("/insercion", insercion);
router.put("/actualizar/:id", actualizar);
router.delete("/eliminar/:id", eliminar);


router.get('/admin', listarUsuariosParaAdmin);
router.put("/logout/:usuario", cerrar_sesion);
router.put('/cambiarEstado/:usuario', cambiarEstadoUsuario);
export default router;