import { Router } from "express";
import { method as profesores } from "../controladores/profesores.controlador";
import { method as permisos} from "../utils/permisos";

const rutas = Router();

rutas.post("/api/registro_profesor" ,permisos.validarPermiso , profesores.alta);
rutas.put("/api/usu_mod_profesor/:dni" ,permisos.validarPermiso , profesores.mod);
rutas.put("/api/usu_estado_profesor/:dni/:id_escuela/:estado" ,permisos.validarPermiso , profesores.estado);
rutas.get("/api/usu_listado_profesores" ,permisos.validarPermiso , profesores.listado);
rutas.get("/api/usu_listado_profesores_sin_paginacion" ,permisos.validarPermiso , profesores.listadoSinPaginacion);


export default rutas ;