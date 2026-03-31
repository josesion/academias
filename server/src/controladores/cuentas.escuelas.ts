import { Request, Response } from 'express';

//  Hooks seccion -----------------------
import { tryCatch } from '../utils/tryCatch';


// Tipados seccion ----------------------



const crearCuentaEscuela = async ( req : Request) => {

};



export const method = {
    crearCuentaEscuela : tryCatch( crearCuentaEscuela ),
};