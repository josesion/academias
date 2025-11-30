import { Router } from "express"; 
import { method as nivelesControlador } from "../controladores/nivel.controlador";
import { method as permisos} from "../utils/permisos";

const ruta = Router();

ruta.post("/api/nivel_usu_alta", permisos.validarPermiso , nivelesControlador.altaNivel );
ruta.put("/api/nivel_usu_modificar/:id/:id_escuela", permisos.validarPermiso , nivelesControlador.modNivel );
ruta.put("/api/nivel_usu_estado/:id/:id_escuela/:estado",permisos.validarPermiso , nivelesControlador.estadoNivel);
ruta.get("/api/listaNivel_usu" ,permisos.validarPermiso , nivelesControlador.listadoNivel)

export default ruta;