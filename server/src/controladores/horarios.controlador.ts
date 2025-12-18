import { Response , Request } from "express";
// hooks
import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";

//Servicios Data
import { method as horariosData } from "../data/horarios.data";

// Typados
import { HorarioClaseInput , HorarioClaseSchema , HorarioCalendarioInput ,CalendarioHorarioSchema } from "../squemas/horarios_clases";
import { CodigoEstadoHTTP } from "../tipados/generico"; 



/**
 * Controlador: altaHorario
 * -----------------------
 * Maneja la creación de un nuevo horario de clases en la academia.
 *
 * Flujo de validación:
 * 1. Valida y tipa la data recibida desde el request usando Zod.
 * 2. Verifica que no exista un horario activo en la misma escuela
 *    para el mismo día y rango horario (regla: una sola clase a la vez).
 * 3. Verifica que el profesor no tenga otra clase asignada en el mismo
 *    día y rango horario, incluso en otra escuela (regla global).
 * 4. Si pasa todas las validaciones, crea el horario en la base de datos.
 *
 * Respuestas posibles:
 * - 201 CREATED: Horario creado correctamente.
 * - 409 CONFLICT: 
 *      • El horario ya está ocupado en la escuela.
 *      • El profesor ya tiene una clase en ese horario.
 * - 400 / 500: Errores de validación o errores inesperados (manejados por tryCatch).
 *
 * @param {Request} req
 * Request de Express que contiene en el body los datos del horario:
 * id_escuela, dni_profesor, id_nivel, id_tipo_clase, día, horario, etc.
 *
 * @param {Response} res
 * Response de Express usada para devolver el resultado de la operación.
 *
 * @returns {Promise<void>}
 * Retorna una respuesta HTTP con el resultado de la operación.
 */

const altaHorario = async( req : Request , res : Response) =>{
    const dataRecivida = req.body;

    const data : HorarioClaseInput = HorarioClaseSchema.parse( dataRecivida );

    const existeHorarioEnEscuela = await horariosData.verificarHorario( data );

    if ( existeHorarioEnEscuela.code === 'HORARIOS_CLASES_EXISTE' ) {
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.CONFLICTO,
            `El dia : ${data.dia_semana} con el horario de ${data.hora_inicio} a ${data.hora_fin} ya está asignado.`,
            existeHorarioEnEscuela.code    
        );
    };

    const  profesorOcupadoGlobalmente = await horariosData.verificarProfesor( data ); 

    if ( profesorOcupadoGlobalmente.code === 'HORARIOS_PROFESOR_EXISTE' ) {
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.CONFLICTO,
            `El profesor con DNI: ${data.dni_profesor} ya tiene una clase asignada .`,
            profesorOcupadoGlobalmente.code    
        );
    }

    const resultado = await horariosData.altaHorario( data );
    if ( resultado.code === 'HORARIOS_CLASES_CREAR' ) {
        return enviarResponse(
            res,
            CodigoEstadoHTTP.CREADO,
            "Horario de clase creado con éxito",
            resultado.data,
            undefined,
            resultado.code
        );
    }else{
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.CONFLICTO,
            "No se pudo crear el horario de clase",
            resultado.code    
        );
    };

}; 

const listadoHorarioEscuela = async( req : Request , res : Response ) =>{
   
    const {id_escuela , estado} = req.query;

    const data : HorarioCalendarioInput = CalendarioHorarioSchema.parse({
        id_escuela : Number(id_escuela),
        estado
    });

    const listado = await horariosData.listaCalendario(data);
 
    if ( listado.code === "NO_ACTIVE_HORARIOS_CLASES"){
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.NO_ENCONTRADO,
            "No existen Clases asignadas",
            listado.code  
        );
    }; 

    return enviarResponse(
        res,
        CodigoEstadoHTTP.OK,
        "Calendiario Escuala ",
        listado.data,
        undefined,
        listado.code
    );   
};



export const method = {
    alta  : tryCatch( altaHorario),
    listadoHorarioEscuela : tryCatch(listadoHorarioEscuela )
};