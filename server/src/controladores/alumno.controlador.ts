/**
 * @fileoverview Controlador Express para la Gestión CRUD (ABML) de la entidad Alumno.
 * @module controllers/alumno.controller
 * @description Contiene los manejadores de rutas para Alta, Baja, Modificación y Listado de alumnos.
 * Utiliza validación de esquemas (Zod) y wrappers de manejo de errores (`tryCatch`).
 */
import { Response , Request } from "express";

import { tryCatch } from "../utils/tryCatch";
import { method as dataAlumno } from "../data/alumno.data";
import { enviarResponse } from "../utils/response";


import {CrearAlumnoSchema, AlumnosInputs,
        listaAlumnosSchema, ListaAlumnoInputs,
        EliminarAlumnoEscuelaSchema, EliminarAlumnoInputs

} from "../squemas/alumno";


/**
 * @function altaAlumno
 * @description Manejador para el registro de un nuevo alumno y su inscripción en una escuela.
 * Realiza un proceso de dos pasos: 1) Verifica si el alumno ya existe por DNI. 
 * 2) Si existe, lo inscribe. Si no existe, lo registra y luego lo inscribe.
 * @async
 * @param {Request} req - Objeto de la solicitud Express (body contiene datos del alumno).
 * @param {Response} res - Objeto de la respuesta Express.
 * @returns {Promise<void>} Envía una respuesta HTTP 200 con el estado de la inscripción.
 */
const altaAlumno = async( req :  Request , res : Response) =>{
    // 1. Validación de entrada
    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(req.body); 
    
    // 2. Verifica si el alumno ya existe en el sistema global
    const existeAlumno = await dataAlumno.verAlumnoExistente(alumnoData.dni);
    
    if ( existeAlumno.error === false ){ 
        // Caso 1: El alumno ya existe (solo se inscribe a la escuela)
        const inscripcion = await dataAlumno.registroAlumnoEscuela({ dni : alumnoData.dni  , id_escuela : alumnoData.id_escuela});
        if ( inscripcion.error === false && inscripcion.code === "STUDENT_ENROLLED") 
        return enviarResponse( res, 200 ,  inscripcion.message , inscripcion.data , undefined , inscripcion.code);
    }else{
        // Caso 2: El alumno no existe (se registra y luego se inscribe)
        const registar = await dataAlumno.registarAlumno(alumnoData);
        if (registar.error === false && registar.code === "ALUMNO_CREATED" ){
            // una vez creada se inscribe a la escuela el alumno 
            const inscripcion = await dataAlumno.registroAlumnoEscuela({ dni : alumnoData.dni  , id_escuela : alumnoData.id_escuela});
            if ( inscripcion.error === false && inscripcion.code === "STUDENT_ENROLLED") 
            return enviarResponse( res, 200 ,  inscripcion.message , inscripcion.data , undefined , inscripcion.code);
        }
    }
};

/**
 * @function modAlumno
 * @description Manejador para la modificación de los datos de un alumno.
 * La modificación se realiza a nivel de los datos principales del alumno y su relación con la escuela.
 * @async
 * @param {Request} req - Objeto de la solicitud Express (params: dni, id_escuela; body: nombre, apellido, celular).
 * @param {Response} res - Objeto de la respuesta Express.
 * @returns {Promise<void>} Envía una respuesta HTTP 200 si la modificación es exitosa.
 */
const modAlumno = async( req : Request, res : Response) =>{

    const { dni , id_escuela} = req.params;
    const { nombre , apellido, celular } = req.body;

    // 1. Construcción del objeto de datos para la validación
    const datoAlumno = { 
        dni : dni ,
        nombre : nombre ,
        apellido : apellido ,
        celular  : String(celular),
        id_escuela : Number(id_escuela)
    } 

    // 2. Validación de entrada (reutilizando el schema de creación)
    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(datoAlumno);
    
    // 3. Ejecución de la lógica de modificación
    const resultado  = await dataAlumno.modAlumno( alumnoData );
    
    if ( resultado.error === false &&  resultado.code === "ALUMNO_MODIFICATION")
    return  enviarResponse(res , 200, resultado.message, resultado.data , undefined , resultado.code);    
}

/**
 * @function borrarAlumno
 * @description Manejador para la baja lógica de un alumno en una escuela específica.
 * La baja se realiza actualizando el estado del alumno en la relación escuela-alumno.
 * @async
 * @param {Request} req - Objeto de la solicitud Express (params: dni, id_escuela, estado).
 * @param {Response} res - Objeto de la respuesta Express.
 * @returns {Promise<void>} Envía una respuesta HTTP 200 si la baja es exitosa.
 */
const borrarAlumno = async( req : Request , res : Response) =>{
    const { dni , id_escuela, estado  } = req.params;
    
    // 1. Validación de entrada
    const alumnoData : EliminarAlumnoInputs = EliminarAlumnoEscuelaSchema.parse({dni, id_escuela: Number(id_escuela), estado});
    
    // 2. Ejecución de la lógica de eliminación
    const respuesta  = await dataAlumno.eliminarAlumno(alumnoData);
    
    if ( respuesta.error === false && respuesta.code === "ALUMNO_DELETE")
        return enviarResponse( res , 200 , respuesta.message , respuesta.data ,undefined , respuesta.code );
};


/**
 * @function listarAlumno
 * @description Manejador para la obtención de un listado paginado y filtrado de alumnos.
 * Permite filtrar por estado, DNI, apellido y escuela.
 * @async
 * @param {Request} req - Objeto de la solicitud Express (query: estado, dni, apellido, limit, pagina, escuela).
 * @param {Response} res - Objeto de la respuesta Express.
 * @returns {Promise<void>} Envía una respuesta HTTP 200 con la lista de alumnos y datos de paginación.
 */
const listarAlumno = async( req: Request  , res : Response) =>{
    const { estado , dni , apellido , limit , pagina, escuela } = req.query;
    
    // 1. Cálculo del offset para la paginación (0-based index)
    const offset = ( Number(pagina) -1 ) * Number(limit) ;
    
    // 2. Validación de los parámetros de listado
    const listadoVerificado : ListaAlumnoInputs = listaAlumnosSchema.parse({
            estado , dni , apellido , escuela : Number(escuela) ,limit : Number(limit) , offset : Number(offset)});
    
    // 3. Ejecución de la lógica de listado
    const listado = await dataAlumno.listaAlumnos(listadoVerificado , Number(pagina));  
    
    // 4. Envío de la respuesta con datos y paginación
    return enviarResponse( res , 200 , listado.message , listado.data , listado.paginacion , listado.code );
}


/**
 * @constant {Object} method
 * @description Exporta las funciones controladoras envueltas en la función de manejo de errores `tryCatch`.
 */
export const  method ={
    altaAlumno   : tryCatch( altaAlumno ),
    modAlumno    : tryCatch( modAlumno ),
    borrarAlumno : tryCatch( borrarAlumno),
    listarAlumno : tryCatch( listarAlumno )
}