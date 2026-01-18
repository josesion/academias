import  { Router} from 'express';
import { method as categoriaCaja} from "../controladores/categorias.caja.controlador" 

const rutas = Router();

rutas.post("/api/categoria_caja", categoriaCaja.altaCategoriaCaja   );

 export default rutas;