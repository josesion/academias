import { tryCatchDatos } from "../utils/tryCatchBD";
import {  method as dataEscuela } from "../data/escuela.data";

const crearEscuela  = async () =>{


};


export const method = {
    crearEscuela : tryCatchDatos( crearEscuela),
}