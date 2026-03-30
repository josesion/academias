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
    };

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
    
}

export const listadoInscripciones = async( data : TipadoInscripcion.FiltroBusqueda, signal? : AbortSignal  )
: Promise<ApiResponse<TipadoInscripcion.InscripcionListadoResult[]>> =>{
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };
    const parametrosQuery = {
        estado: data.estado || "activos",
        id_escuela: data.id_escuela.toString(),
        nombre_alumno : data.nombre_alumno,
        dni_alumno  : data.dni_alumno,
        fecha_desde : data.fecha_desde,
        fecha_hasta : data.fecha_hasta,
        pagina : data.pagina.toString(),
        limit : data.limit.toString()
    }; 
   const ruta  = `${PAGINA}api/list_inscrip?${new URLSearchParams(parametrosQuery as Record<string, string>).toString()}`;
   return await apiFetch( ruta , {
    method : "GET",
    signal
   });
};


export const anularInscripcion  =async ( data : TipadoInscripcion.AnulacionInscripcion ) 
: Promise<ApiResponse<{id_inscripcion : number}>> => {
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };    

    const ruta  = `${PAGINA}api/anular_inscrip`;  

    return apiFetch( ruta , {
        method : "POST",
        body : {
            id_escuela : data.id_escuela,
            id_inscripcion : data.id_inscripcion,
            estadoInsc : data.estadoInsc,
            monto : data.monto,
            metodo_pago : data.metodo_pago,
            descripcion : data.descripcion
        }
    });
};