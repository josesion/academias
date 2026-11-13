import { Router } from "express"; 
import { method as nivelesControlador } from "../controladores/nivel.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post(
    "/api/nivel_usu_alta", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    nivelesControlador.altaNivel
);

ruta.put(
    "/api/nivel_usu_modificar/:id", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    nivelesControlador.modNivel
);

ruta.put(
    "/api/nivel_usu_estado/:id/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    nivelesControlador.estadoNivel
);

ruta.get(
    "/api/listaNivel_usu", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    nivelesControlador.listadoNivel
);

ruta.get(
    "/api/listaNivel_usu_sin_pag", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    nivelesControlador.listadoNivelSinPag
);

export default ruta;