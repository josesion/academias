import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";

// Seccion de tipados Alumnos
import type * as TipadoAlumnos from "../tipadosTs/alumnos";

/**
 * Registra un nuevo alumno en el backend. El email es el identificador principal.
 * El backend genera un PIN de 4 dígitos y lo devuelve en la respuesta.
 */
export const registroAlumno = async( parametro : TipadoAlumnos.RegistroResquest ) 
    :Promise<ApiResponse<TipadoAlumnos.UserData>> =>{
    const ruta  = `${PAGINA}api/registro_alumno`;
    return await apiFetch( ruta , {
        method : "POST",
        body :{
            dni         : parametro.dni || undefined,
            nombre      : parametro.nombre,
            apellido    : parametro.apellido,
            email       : parametro.email, 
            celular     : parametro.celular
        }
    });
}

/**
 * Modifica los datos de un alumno existente. Usa el email como identificador en la URL.
 */
export const modAlumno = async(parametros : TipadoAlumnos.RegistroResquest )
:  Promise<ApiResponse<TipadoAlumnos.AlumnosResponse>> =>{
    const ruta = `${PAGINA}api/mod_alumno/${parametros.email}`;
    return await apiFetch( ruta ,{
        method : "PUT" ,
        body   :{
            dni         : parametros.dni,
            nombre      : parametros.nombre,
            apellido    : parametros.apellido,
            email       : parametros.email,
            celular     : parametros.celular,
        }
    } );
}

/**
 * Da de baja o restaura un alumno. Usa el email como identificador principal,
 * con el DNI como fallback para compatibilidad con el backend actual.
 */
export const eliminarAlumno = async( parametro : TipadoAlumnos.bajaAlumno ) 
: Promise<ApiResponse<TipadoAlumnos.bajaAlumno>> =>{
    const { email, dni, estado } = parametro;
    // Usar email como identificador principal; DNI como fallback
    const identificador = email || dni;
    const ruta = `${PAGINA}api/borrar_alumno/${identificador}/${estado}`;
    return await apiFetch( ruta , {
        method : "DELETE"
    });
}

/**
 * Lista alumnos con paginación. Los filtros incluyen email como identificador principal
 * y DNI como filtro adicional para compatibilidad.
 */
export const listadoAlumnos = async( parametrosQuery : TipadoAlumnos.DataAlumnosListado & TipadoAlumnos.Paginacion,
    signal? : AbortSignal ) 
    : Promise<ApiResponse<TipadoAlumnos.AlumnosResponse[]>> =>{

    const parametrosConvertidos: Record<string, string> = {
        estado : parametrosQuery.estado,
        apellido : parametrosQuery.apellido,
        limit : parametrosQuery.limite.toString(),
        pagina : parametrosQuery.pagina.toString()
    };

    // Agregar email como filtro principal si está presente
    if (parametrosQuery.email) {
        parametrosConvertidos.email = parametrosQuery.email;
    }

    // Mantener DNI como filtro adicional para compatibilidad
    if (parametrosQuery.dni) {
        parametrosConvertidos.dni = parametrosQuery.dni.toString();
    }

const rutaCompleta = `${PAGINA}api/listar_alumno?${new URLSearchParams(parametrosConvertidos).toString()}`;
    return await apiFetch( rutaCompleta , {
        method : "GET",
        signal: signal
    });
};

/**
 * Lista alumnos sin paginación. Usa email como filtro principal con DNI como fallback.
 */
export const listadoAlumnoSinPag = async ( parametros : TipadoAlumnos.DataAlumnosListado, signal? : AbortSignal)
: Promise<ApiResponse<TipadoAlumnos.AlumnosResponse[]>> =>{
     const parametrosFormateado: Record<string, string> = {
        estado      : parametros.estado
     };

     // Agregar email como filtro principal si está presente
     if (parametros.email) {
        parametrosFormateado.email = parametros.email;
     }

     // Mantener DNI como filtro adicional para compatibilidad
     if (parametros.dni) {
        parametrosFormateado.dni = parametros.dni.toString();
     }

     const rutaCompleta = `${PAGINA}api/listar_alumno_sin_pag?${ new URLSearchParams(parametrosFormateado).toString() }`; 

     return await apiFetch( rutaCompleta , {
        method : "GET",
        signal : signal
     });
};