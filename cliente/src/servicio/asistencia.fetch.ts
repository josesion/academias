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

export const asistenciasPorInscripcion = async( data : { id_inscripcion : number }, signal?: AbortSignal )
: Promise<ApiResponse<TipadoAsistencia.AsistenciaInscripcionRow[]>> => {
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
    const ruta = `${PAGINA}api/asistencias_inscripcion/${data.id_inscripcion}`;    
    return await apiFetch( ruta ,{
        method: "GET",
        signal
    });
};

export const infoAlumno = async( dni : number, signal?: AbortSignal )
: Promise<ApiResponse<TipadoAsistencia.InfoAlumno>> => {
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
    const ruta = `${PAGINA}api/info_alumno/${dni}`;    
    return await apiFetch( ruta ,{
        method: "GET",
        signal
    });
};

export const listarPlantillas = async( signal?: AbortSignal )
: Promise<ApiResponse<TipadoAsistencia.PlantillaAsistencia[]>> => {
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
    const ruta = `${PAGINA}api/plantillas`;    
    return await apiFetch( ruta ,{
        method: "GET",
        signal
    });
};

export const crearPlantilla = async( data : { nombre : string; alumnos : number[] }, signal?: AbortSignal )
: Promise<ApiResponse<{ id_plantilla : number }>> => {
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
    const ruta = `${PAGINA}api/plantillas`;    
    return await apiFetch( ruta ,{
        method: "POST",
        body: data,
        signal
    });
};

export const borrarPlantilla = async( id : number, signal?: AbortSignal )
: Promise<ApiResponse<Record<string, never>>> => {
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
    const ruta = `${PAGINA}api/plantillas/${id}`;     
    return await apiFetch( ruta ,{
        method: "DELETE",
        signal
    });
};

/**
 * Registra una asistencia **manual** (spec 043).
 *
 * A diferencia de `registroAsistencia` (kiosko), esta ruta:
 * - no exige la ventana horaria de 15/30 minutos,
 * - sólo admite la clase que está en curso o la próxima,
 * - y bloquea la doble asistencia del mismo alumno en esa clase.
 *
 * @param {TipadoAsistencia.RegistroAsistencia} data - Datos del alumno y la clase.
 * @param {AbortSignal} [signal] - Señal de cancelación.
 */
export const registroAsistenciaManual = async (data: TipadoAsistencia.RegistroAsistencia, signal?: AbortSignal)
: Promise<ApiResponse<TipadoAsistencia.ResultRegistroAsistencia>> => {
    const verificarUser = await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };

    const { dni_alumno, estado, id_horario_clase, id_inscripcion } = data;
    const ruta = `${PAGINA}api/asistencia_manual`;
    return await apiFetch(ruta, {
        method: "POST",
        body: {
            estado,
            id_horario_clase,
            id_inscripcion,
            dni_alumno
        },
        signal
    });
};

/**
 * Agrega uno o varios alumnos a una plantilla existente.
 * @param {number} id_plantilla - Id de la plantilla.
 * @param {number[]} alumnos - DNIs a agregar.
 */
export const agregarAlumnosPlantilla = async( id_plantilla : number, alumnos : number[], signal?: AbortSignal )
: Promise<ApiResponse<{ agregados : number }>> => {
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
    const ruta = `${PAGINA}api/plantillas/${id_plantilla}/alumnos`;
    return await apiFetch( ruta ,{
        method: "POST",
        body: { alumnos },
        signal
    });
};

/**
 * Quita un alumno de una plantilla.
 * @param {number} id_plantilla - Id de la plantilla.
 * @param {number} dni - DNI del alumno a quitar.
 */
export const quitarAlumnoPlantilla = async( id_plantilla : number, dni : number, signal?: AbortSignal )
: Promise<ApiResponse<Record<string, never>>> => {
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
    const ruta = `${PAGINA}api/plantillas/${id_plantilla}/alumnos/${dni}`;
    return await apiFetch( ruta ,{
        method: "DELETE",
        signal
    });
};
