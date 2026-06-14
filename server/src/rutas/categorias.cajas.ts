import  { Router} from 'express';
import { method as categoriaCaja} from "../controladores/categorias.caja.controlador" 
import { method as permisos} from "../utils/permisos";

const rutas = Router();

rutas.post("/api/categoria_caja",permisos.validarPermiso , categoriaCaja.altaCategoriaCaja   );
rutas.put("/api/mod_categoria_caja/:id/:nombre/:movimiento/:estado/:id_escuela", permisos.validarPermiso ,categoriaCaja.modCategoriaCaja);
rutas.put("/api/baja_categoria_caja/:id/:estado/:nombre_categoria",permisos.validarPermiso ,categoriaCaja.bajaCategoriaCaja);
rutas.get("/api/lista_categoria_caja",permisos.validarPermiso, categoriaCaja.listadoCategoriaCaja);
rutas.get("/api/id_inscripcion/:id_escuela", categoriaCaja.buscarInscripcionCategoria);

 
export default rutas;