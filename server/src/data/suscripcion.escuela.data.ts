import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import pool from "../bd";

import { SuscripcionInputs, FiltrosSuscripciones } from "../squemas/suscripciones.escuela";
import { TipadoData } from "../tipados/tipado.data";

const postSuscripcion = async ( data : SuscripcionInputs )
:Promise<TipadoData<{}>> =>{

    const { id_escuela , id_plan_saas, fecha_inscripcion, fecha_vencimiento, estado } = data ;

    const sql : string = `INSERT INTO suscripciones_escuelas (
                                id_escuela, 
                                id_plan_saas, 
                                fecha_inscripcion, 
                                fecha_vencimiento, 
                                estado
                            ) 
                            VALUES (?, ?, ?, ?, ?);`;

    const valores : unknown[] = [id_escuela, id_plan_saas, fecha_inscripcion, fecha_vencimiento, estado];

    return await  iudEntidad({
        slqEntidad : sql,
        valores : valores,
        entidad : "SUSCRIPCION",
        metodo  : "CREAR",
        datosRetorno : {}
    });
};

const verificarSuscripcion = async ( id_escuela : number ) 
:Promise<TipadoData<{id_suscripcion : number}>>  =>{ 

     const sql : string = `SELECT id_suscripcion 
                            FROM suscripciones_escuelas 
                            WHERE id_escuela = ?
                            AND estado = 'activo';`;

    const valores : unknown[] = [ id_escuela ];  
    
    return await  buscarExistenteEntidad({
        slqEntidad : sql,
        valores : valores,
        entidad : "Suspcripcion" 
    });
};


const vencerPlanesEscuelas  = async ( ) => {
  const sql = `UPDATE suscripciones_escuelas 
                            SET estado = 'vencido' 
                            WHERE id_suscripcion > 0 
                            AND estado = 'activo' 
                            AND fecha_vencimiento < CURDATE()`;

  await pool.execute(sql);
};


export interface SuscripcionEscuelaDto {
    id_suscripcion: number;
    id_escuela: number;
    razon_social: string;
    id_plan_saas: number;
    tipo_plan: string;
    descripcion_plan: string;
    fecha_inscripcion: string; // Ya viene formateada como string 'DD/MM/YYYY' desde MySQL
    fecha_vencimiento: string; // Ya viene formateada como string 'DD/MM/YYYY' desde MySQL
    estado_suscripcion: string;
}

const getSuscripciones = async ( data : FiltrosSuscripciones, pagina : string )
:Promise<TipadoData<SuscripcionEscuelaDto[]>> =>{
    const { 
        razon_social, id_plan_saas, estado, fecha_inscripcion,
        limit, offset, 
    } = data ;

    const sql : string =`SELECT 
                            s.id_suscripcion,
                            e.id_escuela,
                            e.razon_social,
                            p.id_plan AS id_plan_saas,
                            p.tipo AS tipo_plan,
                            p.descripcion AS descripcion_plan,
                            DATE_FORMAT(s.fecha_inscripcion, '%d/%m/%Y') AS fecha_inscripcion,
                            DATE_FORMAT(s.fecha_vencimiento, '%d/%m/%Y') AS fecha_vencimiento,
                            s.estado AS estado_suscripcion,
                             COUNT(*) OVER() AS total_registros
                        FROM 
                            suscripciones_escuelas s
                        INNER JOIN 
                            escuelas e ON s.id_escuela = e.id_escuela
                        INNER JOIN 
                            planes_saas p ON s.id_plan_saas = p.id_plan
                        WHERE 
                            -- Filtro por razón social 
                            e.razon_social LIKE ?
                            
                            -- Filtro por ID del plan SaaS 
                            AND CAST(s.id_plan_saas AS CHAR) LIKE ?
                            
                            -- Filtro por fecha de inscripción exactas
                            AND s.fecha_inscripcion like ?
                            
                            -- Filtro por estado de la suscripción
                            AND s.estado like ?
                            LIMIT ${limit} OFFSET ${offset}; ;`; 

    const valores : unknown[] = [razon_social, id_plan_saas, fecha_inscripcion, estado];
    
    return listarEntidad({
        slqListado : sql,
        valores : valores,
        entidad : "LISTADO_SUSP",
        estado  : estado,
        limit : limit, 
        pagina : String(pagina)
    });
};

export const method = {
    postSuscripcion : tryCatchDatos( postSuscripcion ),
    verificarSuscripcion : tryCatchDatos( verificarSuscripcion),
    vencerPlanesEscuelas : tryCatchDatos( vencerPlanesEscuelas ),
    getSuscripciones : tryCatchDatos( getSuscripciones )
};