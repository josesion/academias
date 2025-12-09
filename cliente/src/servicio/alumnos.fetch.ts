import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../hooks/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

// Seccion de tipados Alumnos
import type * as TipadoAlumnos from "../tipadosTs/alumnos";

export const registroAlumno = async( parametro : TipadoAlumnos.RegistroResquest ) 
    :Promise<ApiResponse<TipadoAlumnos.UserData>> =>{

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


    const ruta  = `${PAGINA}api/registro_alumno`;
    return await apiFetch( ruta , {
        method : "POST",
        body :{
            dni         : parametro.dni,
            nombre      : parametro.nombre,
            apellido    : parametro.apellido,
            celular     : parametro.celular,
            id_escuela  : parametro.id_escuela
        }
    });
}

export const modAlumno = async(parametros : TipadoAlumnos.RegistroResquest )
:  Promise<ApiResponse<TipadoAlumnos.AlumnosResponse>> =>{

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

    const ruta = `${PAGINA}api/mod_alumno/${parametros.dni}/${parametros.id_escuela}`;
    return await apiFetch( ruta ,{
        method : "PUT" ,
        body   :{
            nombre      : parametros.nombre,
            apellido    : parametros.apellido,
            celular     : parametros.celular,
        }
    } );
}

export const eliminarAlumno = async( parametro : TipadoAlumnos.bajaAlumno ) 
: Promise<ApiResponse<TipadoAlumnos.bajaAlumno>> =>{
    
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


    const { dni, id_escuela  , estado} = parametro;
    const ruta = `${PAGINA}api/borrar_alumno/${dni}/${id_escuela}/${estado}`;
    return await apiFetch( ruta , {
        method : "DELETE"
    });
}

export const listadoAlumnos = async( parametrosQuery : TipadoAlumnos.DataAlumnosListado & TipadoAlumnos.Paginacion,
    signal? : AbortSignal ) 
    : Promise<ApiResponse<TipadoAlumnos.AlumnosResponse[]>> =>{

    const parametrosConvertidos = {
        estado : parametrosQuery.estado,
        dni : parametrosQuery.dni.toString(),
        apellido : parametrosQuery.apellido,
        limit : parametrosQuery.limite.toString(),
        pagina : parametrosQuery.pagina.toString(),
        escuela : parametrosQuery.id_escuela.toString()
    };

const rutaCompleta = `${PAGINA}api/listar_alumno?${new URLSearchParams(parametrosConvertidos).toString()}`;

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

    return await apiFetch( rutaCompleta , {
        method : "GET",
        signal: signal
    });
}

export const listadoAlumnoSinPag = async ( parametros : TipadoAlumnos.DataAlumnosListado, signal? : AbortSignal)
: Promise<ApiResponse<TipadoAlumnos.AlumnosResponse[]>> =>{
     const parametrosFormateado = {
        estado      : parametros.estado,
        dni         : parametros.dni.toString(),
        id_escuela  : parametros.id_escuela.toString()
     };
     const rutaCompleta = `${PAGINA}api/listar_alumno_sin_pag?${ new URLSearchParams(parametrosFormateado).toString() }`; 

     return await apiFetch( rutaCompleta , {
        method : "GET",
        signal : signal
     });
};