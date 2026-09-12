import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";

import { TipadoData } from "../tipados/tipado.data";
import { PlanSaasInputs } from "../squemas/planes.saas";

export interface ResultPostPlanesSass {
    descripcion : string, 
    tipo : string,
}

const postPlanesSaas = async ( data : PlanSaasInputs)
: Promise<TipadoData<ResultPostPlanesSass>> =>{
     const { tipo , descripcion, precio, cant_flyers, estado } = data; 
       
     const sql = `INSERT INTO planes_saas (tipo, descripcion, precio, cant_flyers, estado) VALUES 
                  ( ?, ?, ?, ?, ?)`;
   
     const valores: unknown[] = [tipo, descripcion, precio, cant_flyers, estado];
     const datosADevolver = { descripcion, tipo };
   
     return await iudEntidad({
       slqEntidad: sql,
       valores,
       entidad: "Planes_Saas",
       metodo: "CREAR",
       datosRetorno: datosADevolver,
     }); 
};

export const method = {
    postPlanesSaas : tryCatchDatos(  postPlanesSaas ),
};          