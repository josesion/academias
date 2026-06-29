import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

// Seccion de tipados Alumnos
import  type * as TipadoAsistencia  from "../tipadosTs/asistencia.typado";

export const asistenciaHorarios =async ( data : TipadoAsistencia.AsistenciaFechas)
: Promise<ApiResponse<TipadoAsistencia.ResulClases_curso_proxima>> =>{

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
    const { estado} = data;
    const ruta  = `${PAGINA}api/asistencia_fechas/${estado}`;    
    return await  apiFetch( ruta , {
        method: "GET"
    });
};

export const registroAsistencia =async ( data : TipadoAsistencia.RegistroAsistencia, signal? : AbortSignal) 
: Promise<ApiResponse<TipadoAsistencia.ResultRegistroAsistencia>> => {
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
    
    const {dni_alumno,estado ,id_horario_clase,id_inscripcion} = data;
    const ruta =  `${PAGINA}api/asistencia`; 
    return await apiFetch( ruta , {
        method : "POST",
        body : {
            estado     : estado,
            id_horario_clase : id_horario_clase,
            id_inscripcion   : id_inscripcion,
            dni_alumno   : dni_alumno
        },
        signal
    });
};

export const obtenerDataAsistencia = async( data : TipadoAsistencia.DataAsistencia, signal?: AbortSignal )
: Promise<ApiResponse<TipadoAsistencia.ResultDataAsistencia>> => {
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
    const { dni_alumno, estado} = data;
    const ruta = `${PAGINA}api/data_asitencia/${dni_alumno}/${estado}`;    
    return await apiFetch( ruta ,{
        method: "GET",
        signal
    });
};
