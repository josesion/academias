import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataAlumno } from "../data/alumno.data";
import { registroHistorial } from "../utils/postHistorial";

import {CrearAlumnoSchema, AlumnosInputs,
        listaAlumnosSchema, ListaAlumnoInputs,
        EliminarAlumnoEscuelaSchema, EliminarAlumnoInputs,
        ListaAlumnoSinPaginacionInputs, listaAlumnoSinPaginacionSchema
} from "../squemas/alumno";

import type { RetornoRegistroAlumno , RetornoModAlumno, DataAlumnosListado ,DataAlumnosListadoSinPag} from "../tipados/alumno.data";
import { type HistorialInputs } from "../squemas/historial";
import { TipadoData } from "../tipados/tipado.data";

/**
 * Servicio encargado de gestionar el alta de un alumno en el sistema.
 * 
 * La lógica sigue un flujo jerárquico:
 * 1. Valida los datos recibidos con `CrearAlumnoSchema`.
 * 2. Verifica si el alumno existe de forma global en la base de datos; si no, lo registra.
 * 3. Verifica si el alumno ya está inscrito en la escuela actual para evitar duplicados.
 * 4. Si el alumno es nuevo en la escuela, realiza la inscripción (`registroAlumnoEscuela`).
 * 5. Si la inscripción es exitosa, registra la creación en el historial de auditoría.
 *
 * @async
 * @function altaAlumno
 * @param {AlumnosInputs} data - Objeto con los datos completos del alumno, ID de escuela y ID de usuario.
 * 
 * @returns {Promise<TipadoData<RetornoRegistroAlumno>>} Promesa que resuelve con:
 * - `REGISTRO_ALUMNO_OK`: Alta exitosa.
 * - `ALUMNO_YA_REGISTRADO`: El alumno ya pertenece a la escuela.
 * - `ERROR_ALTA_PRIMARIA`: Fallo al crear el registro global del alumno.
 * - `ERROR_SERVIDOR`: Fallo inesperado en el proceso.
 * 
 * @throws {ZodError} Si la validación de `CrearAlumnoSchema` falla.
 * 
 * @example
 * const resultado = await altaAlumno({
 *    dni: "35123456",
 *    nombre: "Ana",
 *    apellido: "Lopez",
 *    id_escuela: 1,
 *    id_usuario: 5,
 *    ...
 * });
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

            const dataHistorial  : HistorialInputs = {
                id_escuela :  alumnoData.id_escuela ,
                id_usuario :  alumnoData.id_usuario,
                modulo : "ALUMNOS",
                accion : "CREAR",
                id_registro: Number(alumnoData.dni),
                descripcion: `Registro Alumno ${alumnoData.apellido} ${alumnoData.nombre}`,
                datos: alumnoData // datos del alumno
            }; 
            
    await registroHistorial( dataHistorial);   

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
 * Servicio encargado de actualizar los datos de un alumno existente 
 * y registrar la modificación en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos recibidos utilizando `CrearAlumnoSchema`.
 * 2. Persiste la modificación en la base de datos mediante `dataAlumno.modAlumno`.
 * 3. Si la operación es exitosa (código 'ALUMNO_MODIFICAR'), genera un registro
 *    en el historial de auditoría vinculado al usuario y escuela correspondientes.
 * 4. Retorna el resultado estandarizado de la operación.
 *
 * @async
 * @function modAlumno
 * @param {AlumnosInputs} data - Objeto que contiene todos los campos necesarios para actualizar al alumno 
 * (incluyendo DNI, nombre, apellido, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<TipadoData<RetornoModAlumno>>} Promesa que resuelve con el estado de la operación 
 * (error, mensaje y código interno).
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `CrearAlumnoSchema`.
 * 
 * @example
 * const resultado = await modAlumno({
 *    id_escuela: 1,
 *    id_usuario: 5,
 *    dni: "12345678",
 *    nombre: "Juan",
 *    apellido: "Perez",
 *    ...
 * });
 */
const modAlumno = async( data : AlumnosInputs ) 
: Promise<TipadoData<RetornoModAlumno>> =>{

    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(data);
   
    const resultado  = await dataAlumno.modAlumno( alumnoData ); 
 
    if (resultado.code === "ALUMNO_MODIFICAR" ){
        
        const dataHistorial  : HistorialInputs = {
            id_escuela :  alumnoData.id_escuela ,
            id_usuario :  alumnoData.id_usuario,
            modulo : "ALUMNOS",
            accion : "MODIFICAR",
            id_registro: Number(alumnoData.dni),
            descripcion: `Modificacion de ${alumnoData.apellido} ${alumnoData.nombre}`,
            datos: alumnoData // datos del alumno
        }; 
            
        await registroHistorial( dataHistorial);          


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
 * Servicio encargado de modificar el estado de un alumno en la escuela 
 * y registrar la acción correspondiente en el historial de auditoría de forma dinámica.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante `EliminarAlumnoEscuelaSchema`.
 * 2. Ejecuta el cambio de estado en la capa de datos (`dataAlumno.eliminarAlumno`).
 * 3. Determina de forma dinámica el estado final ("activo" / "inactivo") y la acción de auditoría ("RESTAURAR" / "ELIMINAR") 
 *    dependiendo del valor recibido en el parámetro.
 * 4. Si la operación es exitosa, construye y registra el evento de auditoría en el historial 
 *    utilizando `registroHistorial`.
 * 5. Retorna el resultado estandarizado para la capa de controladores.
 *
 * @async
 * @function estadoAlumno
 * @param {EliminarAlumnoInputs} data - Objeto con los datos de entrada (DNI del alumno, ID de escuela, estado e ID de usuario).
 * 
 * @returns {Promise<TipadoData<{dni: string}>>} Promesa que resuelve con una respuesta exitosa si el cambio se aplicó, 
 * o un objeto de error si ocurrió un fallo en el servidor.
 * 
 * @throws {ZodError} Si los datos de entrada no cumplen con las validaciones del esquema.
 * 
 * @example
 * const resultado = await estadoAlumno({
 *    dni: "12345678",
 *    id_escuela: 1,
 *    id_usuario: 5,
 *    estado: "activos"
 * });
 * 
 * if (!resultado.error) {
 *    console.log(resultado.message);
 * }
 */
const estadoAlumno =async ( data : EliminarAlumnoInputs )
:Promise<TipadoData<{dni : string}>> => {

   const alumnoData : EliminarAlumnoInputs = EliminarAlumnoEscuelaSchema.parse(data);
   const respuesta  = await dataAlumno.eliminarAlumno(alumnoData);  
   const estadoFinal  = alumnoData.estado === "activos" ? "activo" : "inactivo";
   const accionFinal  = alumnoData.estado === "activos" ? "RESTAURAR" : "ELIMINAR"
    

  if ( respuesta.code === 'ALUMNO_ELIMINAR'){

        const dataHistorial  : HistorialInputs = {
            id_escuela :  alumnoData.id_escuela ,
            id_usuario :  alumnoData.id_usuario,
            modulo : "ALUMNOS",
            accion : accionFinal,
            id_registro: Number(alumnoData.dni),
            descripcion: `Estado de ${alumnoData.dni} cambio a  ${estadoFinal}`,
            datos: alumnoData // datos del alumno
        }; 
            
        await registroHistorial( dataHistorial);   

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