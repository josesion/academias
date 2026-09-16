import { Router } from 'express';
import { method as categoriaCaja } from "../controladores/categorias.caja.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const rutas = Router();

rutas.post(
    "/api/categoria_caja", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['intermedio']), 
    categoriaCaja.altaCategoriaCaja
);

rutas.put(
    "/api/mod_categoria_caja/:id/:nombre/:movimiento/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['intermedio']), 
    categoriaCaja.modCategoriaCaja
);

rutas.put(
    "/api/baja_categoria_caja/:id/:estado/:nombre_categoria", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['intermedio']), 
    categoriaCaja.bajaCategoriaCaja
);

rutas.get(
    "/api/lista_categoria_caja", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['intermedio']), 
    categoriaCaja.listadoCategoriaCaja
);

rutas.get(
    "/api/id_inscripcion", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['intermedio']), 
    categoriaCaja.buscarInscripcionCategoria
);

export default rutas;