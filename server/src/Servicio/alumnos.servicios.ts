import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataAlumno } from "../data/alumno.data";
import { method as dataEscuela } from "../data/escuela.data";
import { registroHistorial } from "../utils/postHistorial";
import { enviarCorreoEnBackground, generarPlantillaBienvenida, generarTextoBienvenida } from "../utils/emailService";


import {CrearAlumnoSchema, AlumnosInputs,
        listaAlumnosSchema, ListaAlumnoInputs,
        EliminarAlumnoEscuelaSchema, EliminarAlumnoInputs,
        ListaAlumnoSinPaginacionInputs, listaAlumnoSinPaginacionSchema,
} from "../squemas/alumno";

import type { RetornoRegistroAlumno , RetornoModAlumno, DataAlumnosListado ,DataAlumnosListadoSinPag} from "../tipados/alumno.data";
import { type HistorialInputs } from "../squemas/historial";
import { TipadoData } from "../tipados/tipado.data";

/**
 * Registra un alumno en el sistema de manera global y/o lo inscribe en una escuela específica.
 * 
 * Esta función maneja un flujo multi-escuela (N:M):
 * 1. **Alumno Nuevo:** Si el DNI no existe globalmente, valida que el correo no esté en uso por otra persona, 
 *    crea el registro global del alumno y su usuario, y corta la ejecución devolviendo éxito.
 * 2. **Alumno Existente (Multi-escuela):** Si el DNI ya existe, omite la creación global, valida que no esté 
 *    ya inscripto en la escuela actual, verifica que el correo pertenezca realmente a este alumno y 
 *    procede a vincularlo mediante la tabla intermedia `alumno_escuela`.
 * 
 * @async
 * @param {AlumnosInputs} data - Objeto con los datos del alumno y la escuela (DNI, nombre, apellido, email, celular, id_escuela, id_usuario).
 * @returns {Promise<TipadoData<RetornoRegistroAlumno>>} Retorna un objeto indicando si hubo error, un mensaje descriptivo y un código de estado (ej. REGISTRO_ALUMNO_OK, CORREO_EXISTENTE, ALUMNO_YA_REGISTRADO).
 * 
 * @throws {ZodError} Si los datos de entrada no pasan la validación del esquema `CrearAlumnoSchema`.
 */
const altaAlumno = async (data: AlumnosInputs)
    : Promise<TipadoData<RetornoRegistroAlumno>> => {
    
    const alumnoData: AlumnosInputs = CrearAlumnoSchema.parse(data);
    
    // Verifico si el alumno ya existe en la bd de forma global
    const existeAlumno = await dataAlumno.verAlumnoExistente(alumnoData.dni);

    if (existeAlumno.code === 'ALUMNO_NO_EXISTE') {
        // Si no existe, creamos por primera vez de forma global
        const existeCorreo = await dataAlumno.verificarCorreoExistente(alumnoData.email);

        if (existeCorreo.code === "USUARIO_CORREO_EXISTE") {
            return {
                error: true,
                message: "El correo ya se encuentra registrado, intente con otro 2.",
                code: "CORREO_EXISTENTE"
            };
        };
        
        const registrarAlumno = await dataAlumno.altaAlumnoTransaccion(alumnoData);


        if (registrarAlumno.code === "TRANSACCION_FALLIDA") {
            return {
                error: true,
                message: "Error en la creacion de alumno intente nuevamente mas tarde.",
                code: "ERROR_TRANSACCION"
            };
        };

        if (registrarAlumno.code === "TRANSACCION_OK") {

            // Nombre de la academia para personalizar el correo (si no se encuentra, se omite)
            const escuela = await dataEscuela.localizarNombreEscuela(alumnoData.id_escuela);
            const nombreEscuela = escuela.data?.razon_social;

            const htmlContenido = generarPlantillaBienvenida(
                alumnoData.nombre, 
                alumnoData.email,
                registrarAlumno.data?.contrasenaTemporal,
                nombreEscuela
            );

            // Modo prueba: mientras `RESEND_DESTINO` esté seteada, el correo va a esa
            // casilla en vez de al alumno. Se vacía para enviar a los alumnos reales.
            const destino = process.env.RESEND_DESTINO?.trim() || alumnoData.email;

            // En segundo plano: el alta ya quedó hecha y no debe frenarse por el correo.
            // Un fallo queda en `logs/errores.log` y avisa a `CORREO_ADMIN`.
            enviarCorreoEnBackground({
                to: destino,
                subject: "¡Tus credenciales de acceso a la Academia!",
                html: htmlContenido,
                text: generarTextoBienvenida(
                    alumnoData.nombre,
                    alumnoData.email,
                    registrarAlumno.data?.contrasenaTemporal,
                    nombreEscuela
                ),
                replyTo: process.env.CORREO_ADMIN?.trim() || undefined
            }, `Alta alumno ${alumnoData.dni}`);

            return {
                error: false, // Corregido para que devuelva éxito correctamente
                message: "Registro del alumno ok.",
                code: "REGISTRO_ALUMNO_OK"
            };
        };
    };
        
    // Verifico si el alumno ya se encuentra en esta escuela
    const existeAlumnoEscuela = await dataAlumno.verAlumnoEscuelaExistente(String(alumnoData.dni), Number(alumnoData.id_escuela)); 

    if (existeAlumnoEscuela.code === "ALUMNOESCUELA_EXISTE") {
        return {
            error: true, 
            message: "El alumno ya se encuentra registrado en esta escuela",
            code: "ALUMNO_YA_REGISTRADO"
        };
    };

    // Verifico que el correo no le pertenezca a otro alumno distinto (excluyendo al DNI actual)
    const correoPropiedadAlumno = await dataAlumno.verificarCorreoExistente2(alumnoData.email, alumnoData.dni);

    if (correoPropiedadAlumno.code === "USUARIO_CORREO_EXISTE") {
        return {
            error: true,
            message: "El correo ya pertenece a otro alumno.",
            code: "CORREO_EXISTENTE"          
        };
    };

    // Realiza la inscripción en la nueva escuela
    const inscripcionAlumno = await dataAlumno.registroAlumnoEscuela({ dni: String(alumnoData.dni), id_escuela: Number(alumnoData.id_escuela) });
    
    if (inscripcionAlumno.code === "ALUMNO_ALTA") {
        const dataHistorial: HistorialInputs = {
            id_escuela: alumnoData.id_escuela,
            id_usuario: alumnoData.id_usuario,
            modulo: "ALUMNOS",
            accion: "CREAR",
            id_registro: Number(alumnoData.dni),
            descripcion: `Registro Alumno ${alumnoData.apellido} ${alumnoData.nombre}`,
            datos: alumnoData
        }; 
        
        await registroHistorial(dataHistorial);   

        return {
            error: false,
            message: "Se registro correctamente el alumno",
            code: "REGISTRO_ALUMNO_OK"
        };
    };

    return {
        error: true, 
        message: "Error en el servidor , intentar nuevamente.",
        code: "ERROR_SERVIDOR"
    };
};


/**
 * Modifica los datos globales de un alumno y sus credenciales de usuario asociadas 
 * de forma transaccional. 
 * 
 * Valida la disponibilidad del correo electrónico (excluyendo al propio alumno), 
 * ejecuta la actualización atómica en la base de datos, registra el evento en 
 * el historial y retorna el estado de la operación.
 * 
 * @async
 * @param {AlumnosInputs} data - Objeto con los datos actualizados del alumno (DNI, nombre, apellido, email, celular, etc.).
 * @returns {Promise<TipadoData<RetornoModAlumno>>} Retorna un objeto indicando si hubo error, un mensaje descriptivo y un código de control.
 * 
 * @throws {ZodError} Si la validación con `CrearAlumnoSchema` falla.
 */

const modAlumno = async (data: AlumnosInputs) 
: Promise<TipadoData<RetornoModAlumno>> => {

    const alumnoData: AlumnosInputs = CrearAlumnoSchema.parse(data);
   
    // 1. Validación de correo por afuera (excluyendo el DNI propio)
    const correoPropiedadAlumno = await dataAlumno.verificarCorreoExistente2(alumnoData.email, alumnoData.dni);

    if (correoPropiedadAlumno.code === "USUARIO_CORREO_EXISTE") {
        return {
            error: true,
            message: "El correo ya pertenece a otro alumno, intente con otro.",
            code: "CORREO_EXISTENTE"
        };
    };

    // 2. Ejecutar la transacción de actualización limpia en la BD
    const resultadoModificacion = await dataAlumno.modAlumnoTransaccion(alumnoData); 

  
    if (resultadoModificacion.code === "TRANSACCION_FALLIDA") {
        return {
            error: true,
            message: "Error al actualizar los datos, intente nuevamente.",
            code: "ERROR_TRANSACCION"
        };
    };

    // 3. Si todo salió bien, guardamos historial y respondemos éxito
    const dataHistorial: HistorialInputs = {
        id_escuela: alumnoData.id_escuela,
        id_usuario: alumnoData.id_usuario,
        modulo: "ALUMNOS",
        accion: "MODIFICAR",
        id_registro: Number(alumnoData.dni),
        descripcion: `Modificacion de ${alumnoData.apellido} ${alumnoData.nombre}`,
        datos: alumnoData
    }; 
        
    await registroHistorial(dataHistorial);         

    return {
        error: false,
        message: "Se modifico correctamente",
        code: "ALUMNO_MODIFICAR_OK"
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