import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import pool from "../bd";

import { SuscripcionInputs } from "../squemas/suscripciones.escuela";
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


const vencerPlanesEscuelas  = async () => {
  const sql = `UPDATE suscripciones_escuelas 
                            SET estado = 'vencido' 
                            WHERE id_suscripcion > 0 
                            AND estado = 'activo' 
                            AND fecha_vencimiento < CURDATE()`;

  await pool.execute(sql);
};


export const method = {
    postSuscripcion : tryCatchDatos( postSuscripcion ),
    verificarSuscripcion : tryCatchDatos( verificarSuscripcion),
    vencerPlanesEscuelas : tryCatchDatos( vencerPlanesEscuelas ),
};