import  { Router} from 'express';
import { method as categoriaCaja} from "../controladores/categorias.caja.controlador" 

const rutas = Router();

rutas.post("/api/categoria_caja", categoriaCaja.altaCategoriaCaja   );
rutas.put("/api/mod_categoria_caja/:id/:nombre/:movimiento/:estado/:id_escuela", categoriaCaja.modCategoriaCaja);
rutas.delete("/api/baja_categoria_caja/:id/:estado/:id_escuela",categoriaCaja.bajaCategoriaCaja);
rutas.get("/api/lista_categoria_caja", categoriaCaja.listadoCategoriaCaja)
 
export default rutas;