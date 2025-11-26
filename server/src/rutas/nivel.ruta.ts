import { Router } from "express"; 
import { method as nivelesControlador } from "../controladores/nivel.controlador";


const ruta = Router();

ruta.post("/api/nivel_usu_alta",  nivelesControlador.altaNivel );
ruta.put("/api/nivel_usu_modificar/:id/:id_escuela",  nivelesControlador.modNivel );
ruta.put("/api/nivel_usu_estado/:id/:id_escuela/:estado", nivelesControlador.estadoNivel);
ruta.get("/api/listaNivel_usu" , nivelesControlador.listadoNivel)

export default ruta;