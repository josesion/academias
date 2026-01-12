import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../hooks/apiFetch";
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
    const {id_escuela, estado} = data;
    const ruta  = `${PAGINA}api/asistencia_fechas/${id_escuela}/${estado}`;    
    return await  apiFetch( ruta , {
        method: "GET"
    });
};