import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataAlumno } from "../data/alumno.data";

import {CrearAlumnoSchema, AlumnosInputs,
        listaAlumnosSchema, ListaAlumnoInputs,
        EliminarAlumnoEscuelaSchema, EliminarAlumnoInputs,
        ListaAlumnoSinPaginacionInputs, listaAlumnoSinPaginacionSchema
} from "../squemas/alumno";

import type { RetornoRegistroAlumno , RetornoModAlumno, DataAlumnosListado ,DataAlumnosListadoSinPag} from "../tipados/alumno.data";
import { TipadoData } from "../tipados/tipado.data";

/**
 * Registra un alumno en el sistema global (si no existe) y lo vincula a una escuela específica.
 * * @async
 * @function altaAlumno
 * @param {AlumnosInputs} data - Datos de entrada del alumno enviados por el cliente.
 * @returns {Promise<TipadoData<RetornoRegistroAlumno>>} Objeto de respuesta unificado con el estado de la operación y los datos del alumno registrado.
 * @throws {ZodError} Si los datos de entrada no cumplen con las reglas de `CrearAlumnoSchema`.
 */
const altaAlumno = async( data : AlumnosInputs)
: Promise<TipadoData<RetornoRegistroAlumno>> =>{
    
    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(data);
    // Verifico si el alumno ya existe en la bd de forma global
    const existeAlumno = await dataAlumno.verAlumnoExistente(alumnoData.dni);

    if ( existeAlumno.code ==='ALUMNO_NO_EXISTE' ){ 
        // si no existe creamos por primera vez y unica en la bd de forma global
        const nuevoAlumno = await dataAlumno.registarAlumno(alumnoData);
        //  Se crea por primera vez , si no se logro lanzamos un error y si no seguimos 
        if (nuevoAlumno.error  === true){
            return {
                error : true ,
                message : "Error en alta primaria del alumno",
                code : "ERROR_ALTA_PRIMARIA"
            };
        };
    };
       
   // Verifico si el alumno ya se encuentra en esta escuela , si esta lanzamos error y si no seguimos la funcion
   const existeAlumnoEscuela = await dataAlumno.verAlumnoEscuelaExistente(String(alumnoData.dni) , Number(alumnoData.id_escuela) ); 

   if (existeAlumnoEscuela.code === "ALUMNOESCUELA_EXISTE"){
        return{
            error : true, 
            message : "El alumno ya se encuentra registrado en esta escuela",
            code : "ALUMNO_YA_REGISTRADO"
        };
   };

   const inscripcionAlumno = await dataAlumno.registroAlumnoEscuela({ dni: String(alumnoData.dni) , id_escuela : Number(alumnoData.id_escuela) });
   
   if ( inscripcionAlumno.code === "ALUMNO_ALTA"){
        return {
            error : false,
            message : "Se registro correctamente el alumno",
            code : "REGISTRO_ALUMNO_OK"
        };
   };

   return{
        error : true, 
        message : "Error en el servidor , intentar nuevamente.",
        code : "ERROR_SERVIDOR"
   };

};


/**
 * Modifica la información personal de un alumno existente en el sistema.
 * * @async
 * @function modAlumno
 * @param {AlumnosInputs} data - Datos actualizados del alumno.
 * @returns {Promise<TipadoData<RetornoModAlumno>>} Objeto de respuesta unificado que indica si la modificación fue exitosa.
 * @throws {ZodError} Si los datos de entrada no cumplen con las reglas de `CrearAlumnoSchema`.
 */
const modAlumno = async( data : AlumnosInputs ) 
: Promise<TipadoData<RetornoModAlumno>> =>{

    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(data);
   
    const resultado  = await dataAlumno.modAlumno( alumnoData ); 
 
    if (resultado.code === "ALUMNO_MODIFICAR" ){
        return {
            error: false,
            message : "Se modifico Correctamente",
            code : "ALUMNO_MODIFICAR_OK"
        };
    };

   return{
        error : true, 
        message : "Error en el servidor , intentar nuevamente.",
        code : "ERROR_SERVIDOR"
   };    

};

/**
 * Modifica el estado activo/inactivo (baja lógica o alta) de un alumno dentro de una escuela específica.
 * * @async
 * @function estadoAlumno
 * @param {EliminarAlumnoInputs} data - Contiene el DNI, ID de la escuela y el nuevo estado.
 * @returns {Promise<TipadoData<{dni : string}>>} Objeto de respuesta con el DNI del alumno afectado.
 * @throws {ZodError} Si los datos de entrada no cumplen con las reglas de `EliminarAlumnoEscuelaSchema`.
 */
const estadoAlumno =async ( data : EliminarAlumnoInputs )
:Promise<TipadoData<{dni : string}>> => {

   const alumnoData : EliminarAlumnoInputs = EliminarAlumnoEscuelaSchema.parse({ dni : data.dni, 
                                                                                 id_escuela : data.id_escuela, 
                                                                                 estado :  data.estado});
   const respuesta  = await dataAlumno.eliminarAlumno(alumnoData);  

  if ( respuesta.code === 'ALUMNO_ELIMINAR'){
     return {
        error : false, 
        message : "Se modifico el estado del alumno correctamente",
        code : "CAMBIO_ESTADO_ALUMNO_OK"
     };
  };  

   return{
        error : true, 
        message : "Error en el servidor , intentar nuevamente.",
        code : "ERROR_SERVIDOR"
   };    
};

/**
 * Obtiene el listado de alumnos vinculados a una escuela de forma paginada.
 * * @async
 * @function listaAlumnos
 * @param {ListaAlumnoInputs} data - Parámetros de ordenamiento, filtros, ID de escuela y página actual.
 * @returns {Promise<TipadoData<DataAlumnosListado[]>>} Listado paginado de alumnos junto con la metadata de paginación.
 * @throws {ZodError} Si los parámetros de búsqueda o paginación no cumplen con `listaAlumnosSchema`.
 */
const listaAlumnos = async( data: ListaAlumnoInputs ) 
: Promise<TipadoData<DataAlumnosListado[]>> => { 

    const listadoData : ListaAlumnoInputs = listaAlumnosSchema.parse(data);
  
    const respuesta  = await dataAlumno.listaAlumnos(listadoData, data.pagina);
  
    if ( respuesta.code === 'ALUMNO_LISTED' ){
        return {
            error : false,
            message : "Listado Alumnos",
            code : "ALUMNO_LISTED_OK",
            data: respuesta.data, 
            paginacion: respuesta.paginacion
        };
    };

    return{
            error : true, 
            message : "Error en el servidor , intentar nuevamente.",
            code : "ERROR_SERVIDOR"
    };    
};

/**
 * Obtiene el listado completo de alumnos vinculados a una escuela sin paginación (ideal para selectores o reportes).
 * * @async
 * @function listadoSinPaginacion
 * @param {ListaAlumnoSinPaginacionInputs} data - Filtros de búsqueda y el ID de la escuela.
 * @returns {Promise<TipadoData<DataAlumnosListadoSinPag[]>>} Listado completo de alumnos que coinciden con los criterios.
 * @throws {ZodError} Si los parámetros de entrada no cumplen con `listaAlumnoSinPaginacionSchema`.
 */
const listadoSinPaginacion = async( data : ListaAlumnoSinPaginacionInputs ) 
: Promise<TipadoData<DataAlumnosListadoSinPag[]>> => {

    const dataListado : ListaAlumnoSinPaginacionInputs = listaAlumnoSinPaginacionSchema.parse(data);

    const respuesta  = await dataAlumno.listadoSinPaginacion(dataListado);

    if ( respuesta.code === 'ALUMNO_LISTED' ){
        return {
            error : false,
            message : "Listado Alumnos",
            code : "ALUMNO_LISTED_OK",
            data: respuesta.data
        };
    }

    return{
            error : true, 
            message : "Error en el servidor , intentar nuevamente.",
            code : "ERROR_SERVIDOR"
    };    

};

export const method = {
    altaAlumno : tryCatchDatos(altaAlumno),
    modAlumno  : tryCatchDatos(modAlumno),
    estadoAlumno : tryCatchDatos(estadoAlumno),
    listaAlumnos : tryCatchDatos(listaAlumnos),
    listadoSinPaginacion : tryCatchDatos(listadoSinPaginacion),
};