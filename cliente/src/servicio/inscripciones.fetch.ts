import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

// Seccion de tipados Alumnos

import  type * as TipadoInscripcion  from "../tipadosTs/inscripciones";
import  type { DataDetalleCaja } from "../tipadosTs/caja.typado";


type PayloadInscripcionCompleto = TipadoInscripcion.inscripcionData & Omit<DataDetalleCaja, 'referencia_id'>;

export const incripcion =async ( datos : PayloadInscripcionCompleto )
: Promise<ApiResponse<TipadoInscripcion.ResultInscripcion>> =>{


    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const ruta  = `${PAGINA}api/inscripcion`;  
    return await apiFetch( ruta , {
        method : "POST",
        body   :{
            id_plan                     : datos.id_plan ,
            id_escuela                  : datos.id_escuela,
            dni_alumno                  : datos.dni_alumno,
            fecha_inicio                : datos.fecha_inicio,
            fecha_fin                   : datos.fecha_fin,
            monto                       : datos.monto,
            clases_asignadas_inscritas  : datos.clases_asignadas_inscritas,
            meses_asignados_inscritos   : datos.meses_asignados_inscritos,
            estado : "activos",
            
            id_caja : datos.id_caja,
            id_categoria : datos.id_categoria,
            metodo_pago : datos.metodo_pago,
            descripcion : datos.descripcion,
        }
    });

};