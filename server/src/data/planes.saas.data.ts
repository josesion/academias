import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";
import { PlanSaasInputs, PlanDeletSaasInputs, FiltroPlanesInputs, PlanEstadoSaasInputs } from "../squemas/planes.saas";

export interface ResultPostPlanesSass {
    descripcion : string, 
    tipo : string,
};

const postPlanesSaas = async (data: PlanSaasInputs): Promise<TipadoData<ResultPostPlanesSass>> => {
     // 1. Agregamos caracteristicas a la desestructuración
     const { tipo, descripcion, precio, cant_flyers, estado, caracteristicas } = data; 
       
     // 2. Sumamos la columna caracteristicas al INSERT y su respectivo placeholder (?)
     const sql = `INSERT INTO planes_saas (tipo, descripcion, precio, cant_flyers, caracteristicas, estado) VALUES 
                   ( ?, ?, ?, ?, ?, ?)`;
   
     // 3. Incluimos caracteristicas en el array de valores. 
     // Nota: Dependiendo de tu driver de MySQL (ej. mysql2), podés pasar el objeto directo o usar JSON.stringify() si la BD espera un string JSON.
     const valores: unknown[] = [
         tipo, 
         descripcion, 
         precio, 
         cant_flyers, 
         caracteristicas ? JSON.stringify(caracteristicas) : null, 
         estado
     ];
     
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
};

const modPlanesSaas = async ( data : PlanSaasInputs)
: Promise<TipadoData<PlanSaasConId>> =>{

    // 1. Extraemos caracteristicas junto con el resto de los campos
    const { tipo, descripcion, precio, cant_flyers, estado, id_plan, caracteristicas } = data; 

    if ( !id_plan ){
        return {
            error : true,
            message : "Verifique el id plan",
            code : "ID_INVALIDO"
        }
    };

     // 2. Sumamos caracteristicas al UPDATE de la consulta SQL
     const sql = `UPDATE planes_saas 
                    SET 
                        tipo = ?, 
                        descripcion = ?, 
                        precio = ?, 
                        cant_flyers = ?, 
                        caracteristicas = ?, 
                        estado = ?
                    WHERE id_plan = ?;`;
   
     // 3. Incluimos JSON.stringify(caracteristicas) en el array de valores respetando el orden de los interrogantes (?)
     const valores: unknown[] = [
         tipo, 
         descripcion, 
         precio, 
         cant_flyers, 
         caracteristicas ? JSON.stringify(caracteristicas) : null, 
         estado, 
         id_plan
     ];
     
     const datosADevolver = { descripcion, tipo, id_plan };
   
     return await iudEntidad<PlanSaasConId>({
       slqEntidad: sql,
       valores,
       entidad: "Planes_Saas",
       metodo: "MODIFICAR",
       datosRetorno: datosADevolver,
     }); 
};


const bajaPlanesSaas = async ( data : PlanEstadoSaasInputs)
: Promise<TipadoData<{id_plan : number}>> =>{

    const { id_plan, estado } = data; 

    if ( !id_plan  ){
        return {
            error : true,
            message : "Verifique el id plan",
            code : "ID_INVALIDO"
        }
    };

     const sql = `UPDATE planes_saas 
                    SET estado = ? 
                    WHERE id_plan = ?;`;
   
     const valores: unknown[] = [ estado, id_plan];
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
    precio: number;
    cant_flyers: number;
    caracteristicas: any; // O podés tiparlo con la estructura exacta del objeto si lo preferís
    estado: 'activo' | 'inactivo';
};

const listaPlanesSaas = async ( estado : FiltroPlanesInputs )
: Promise<TipadoData<PlanSaasRow[]>> => {
    // Agregamos caracteristicas al SELECT
    const sql: string = `SELECT id_plan, tipo, descripcion, precio, cant_flyers, caracteristicas, estado 
                            FROM planes_saas 
                            WHERE estado = ? ;`;

    const valores: unknown[] = [estado.estado];

    return await listarEntidadSinPaginacion({
        slqListado: sql,
        valores: valores,
        entidad: "PLANES_SAAS",
        estado: ""
    });
};

export const method = {
    postPlanesSaas : tryCatchDatos(  postPlanesSaas ),
    modPlanesSaas  : tryCatchDatos( modPlanesSaas ),
    deletPlanesSaas: tryCatchDatos( deletPlanesSaas ),  
    bajaPlanesSaas : tryCatchDatos( bajaPlanesSaas ),
    listaPlanesSaas : tryCatchDatos( listaPlanesSaas)
};          