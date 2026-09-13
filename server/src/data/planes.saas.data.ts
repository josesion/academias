import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";
import { PlanSaasInputs, PlanDeletSaasInputs } from "../squemas/planes.saas";

export interface ResultPostPlanesSass {
    descripcion : string, 
    tipo : string,
};

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

export interface PlanSaasConId extends ResultPostPlanesSass {
    id_plan: number;
}
const modPlanesSaas = async ( data : PlanSaasInputs)
: Promise<TipadoData<PlanSaasConId>> =>{

    const { tipo , descripcion, precio, cant_flyers, estado, id_plan } = data; 

    if ( !id_plan  ){
        return {
            error : true,
            message : "Verifique el id plan",
            code : "ID_INVALIDO"
        }
    };

     const sql = `UPDATE planes_saas 
                    SET 
                        tipo = ?, 
                        descripcion = ?, 
                        precio = ?, 
                        cant_flyers = ?, 
                        estado = ?
                    WHERE id_plan = ?;`;
   
     const valores: unknown[] = [tipo, descripcion, precio, cant_flyers, estado, id_plan];
     const datosADevolver = { descripcion, tipo , id_plan };
   
     return await iudEntidad<PlanSaasConId>({
       slqEntidad: sql,
       valores,
       entidad: "Planes_Saas",
       metodo: "MODIFICAR",
       datosRetorno: datosADevolver,
     }); 
};


const bajaPlanesSaas = async ( data : PlanSaasInputs)
: Promise<TipadoData<{id_plan : number}>> =>{

    const { id_plan } = data; 

    if ( !id_plan  ){
        return {
            error : true,
            message : "Verifique el id plan",
            code : "ID_INVALIDO"
        }
    };

     const sql = `UPDATE planes_saas 
                    SET estado = 'inactivo' 
                    WHERE id_plan = ?;`;
   
     const valores: unknown[] = [ id_plan];
     const datosADevolver = {  id_plan };
   
     return await iudEntidad<{id_plan : number}>({
       slqEntidad: sql,
       valores,
       entidad: "Planes_Saas",
       metodo: "MODIFICAR",
       datosRetorno: datosADevolver,
     }); 
};

export interface PlanDelet {
    id_plan : number
};

const deletPlanesSaas = async ( data : PlanDeletSaasInputs)
: Promise<TipadoData<PlanDelet>> =>{

    const {  id_plan } = data; 

     const sql = `DELETE FROM planes_saas WHERE id_plan = ?;`;
   
     const valores: unknown[] = [ id_plan];
     const datosADevolver = {  id_plan };
   
     return await iudEntidad<PlanDelet>({
       slqEntidad: sql,
       valores,
       entidad: "Planes_Saas",
       metodo: "ELIMINAR",
       datosRetorno: datosADevolver,
     }); 
};

export interface PlanSaasRow {
    id_plan: number;
    tipo: 'basico' | 'intermedio' | 'premium';
    descripcion: string;
    precio: number; // En MySQL los DECIMAL suelen llegar como string o number según el driver, pero number es lo standard
    cant_flyers: number;
    estado: 'activo' | 'inactivo';
};

const listaPlanesSaas = async ()
:Promise<TipadoData<PlanSaasRow[]>> =>{

    const sql : string = `SELECT id_plan, tipo, descripcion, precio, cant_flyers, estado FROM planes_saas;`;

    const valores : unknown[] = [];

    return  await listarEntidadSinPaginacion({
        slqListado : sql,
        valores : valores,
        entidad : "PLANES_SAAS",
        estado : ""
    });
};

export const method = {
    postPlanesSaas : tryCatchDatos(  postPlanesSaas ),
    modPlanesSaas  : tryCatchDatos( modPlanesSaas ),
    deletPlanesSaas: tryCatchDatos( deletPlanesSaas ),  
    bajaPlanesSaas : tryCatchDatos( bajaPlanesSaas ),
    listaPlanesSaas : tryCatchDatos( listaPlanesSaas)
};          