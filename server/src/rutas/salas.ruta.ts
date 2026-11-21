import { Router } from "express"; 
import { method as salasControlador } from "../controladores/salas.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post(
    "/api/sala_usu_alta", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    salasControlador.altaSala
);

ruta.put(
    "/api/sala_usu_modificar/:id", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    salasControlador.modSala
);

ruta.put(
    "/api/sala_usu_estado/:id/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    salasControlador.estadoSalaCtrl
);

ruta.get(
    "/api/listaSala_usu", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    salasControlador.listadoSalas
);

ruta.get(
    "/api/listaSala_usu_sin_pag", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    salasControlador.listadoSalasSinPag
);

export default ruta;
