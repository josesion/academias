
import { tryCatchDatos } from "../utils/tryCatchBD";

//Servicios Data
import { method as HorariosData } from "../data/horarios.data";

// Typados----------------------------
import * as TipadoHorario from "../squemas/horarios_clases";
import { ResultCalendarioHorario, ResultadoAltaHorario } from "../tipados/horarios";
import { TipadoData } from "../tipados/tipado.data";


/**
 * servicioCalendarioHorario
 * -------------------------
 * Obtiene el calendario de horarios de clases de una escuela,
 * aplicando filtros opcionales como estado u otros criterios definidos
 * en el esquema de entrada.
 *
 * La función:
 *  - Valida los datos de entrada mediante `CalendarioHorarioSchema`
 *  - Consulta la capa de datos para obtener los horarios activos
 *  - Devuelve un calendario formateado para consumo del controlador
 *
 * Regla de negocio:
 *  - Si no existen horarios activos para la escuela, se considera
 *    un calendario vacío y se devuelve un código específico.
 *
 * @async
 *
 * @param {TipadoHorario.HorarioCalendarioInput} data
 * Objeto con los filtros para obtener el calendario de horarios.
 *
 * @returns {Promise<TipadoData<ResultCalendarioHorario[]>>}
 * Retorna un objeto TipadoData con:
 *  - `error: true` y `code: 'CALENDARIO_VACIO'` si no existen clases asignadas
 *  - `error: false` y `code: 'CALENDARIO_ESCUELA_LISTADO'` si el calendario fue obtenido correctamente
 *
 * @throws {Error}
 * Puede lanzar errores de validación (Zod) o errores provenientes de la capa de datos.
 */

const servicioCalendarioHorario = async( data : TipadoHorario.HorarioCalendarioInput) 
: Promise<TipadoData<ResultCalendarioHorario[]>> =>{

    const dataCalendario : TipadoHorario.HorarioCalendarioInput = TipadoHorario.CalendarioHorarioSchema.parse( data );

    const calendario  = await HorariosData.listaCalendario(dataCalendario);

    if ( calendario.code === "NO_ACTIVE_HORARIOS_CLASES"){
        return {
            error: true,
            message: "No existen clases asignadas en el calendario",
            code: "CALENDARIO_VACIO"
        }
    };

    return {
        error: false,
        message: "Calendario de la escuela obtenido correctamente",
        data: calendario.data,
        code: "CALENDARIO_ESCUELA_LISTADO"
    };
};



/**
 * servicioAltaCalendario
 * ----------------------
 * Crea un nuevo horario de clase en el calendario de una escuela,
 * validando previamente la disponibilidad del horario y del profesor.
 *
 * Flujo de validaciones:
 *  1. Valida los datos de entrada mediante `HorarioClaseSchema`
 *  2. Verifica que el horario no esté ocupado en la escuela
 *  3. Verifica que el profesor no tenga clases asignadas en el mismo horario
 *     (regla de negocio global, independientemente de la escuela)
 *  4. Si todas las validaciones pasan, crea el horario
 *
 * Reglas de negocio:
 *  - Un horario no puede solaparse con otro horario activo de la misma escuela
 *  - Un profesor no puede dictar dos clases en el mismo día y horario
 *
 * @async
 *
 * @param {TipadoHorario.HorarioClaseInput} data
 * Objeto con la información necesaria para crear un horario de clase.
 *
 * @returns {Promise<TipadoData<ResultadoAltaHorario>>}
 * Retorna un objeto TipadoData con los siguientes casos posibles:
 *
 *  - `error: true` y `code: 'HORARIO_OCUPADO'`
 *    Si el horario ya está asignado en la escuela.
 *
 *  - `error: true` y `code: 'PROFESOR_OCUPADO'`
 *    Si el profesor ya tiene una clase asignada en el mismo horario.
 *
 *  - `error: false` y `code: 'HORARIO_CREADO_EXITOSAMENTE'`
 *    Si el horario se crea correctamente.
 *
 *  - `error: true` y `code: 'HORARIOS_PROBLEMAS'`
 *    Si ocurre un error al intentar crear el horario.
 *
 * @throws {Error}
 * Puede lanzar errores de validación (Zod) o errores inesperados
 * provenientes de la capa de datos.
 */
const servicioAltaCalendario = async( data : TipadoHorario.HorarioClaseInput) 
: Promise<TipadoData<ResultadoAltaHorario>> =>{
    
    const dataClasesHorario : TipadoHorario.HorarioClaseInput = TipadoHorario.HorarioClaseSchema.parse(data);

    const clasesHorario = await HorariosData.verificarHorarioEscuela( dataClasesHorario );

    if ( clasesHorario.code === 'HORARIOS_CLASES_EXISTE'){
        return{
            error: true,
            message:`El dia : ${data.dia_semana} con el horario de ${data.hora_inicio} a ${data.hora_fin} ya está asignado.`,
            code: "HORARIO_OCUPADO"            
        }
    };

    const profesorOcupadoGlobalmente = await HorariosData.verificarProfesor( dataClasesHorario );
    if ( profesorOcupadoGlobalmente.code === 'HORARIOS_PROFESOR_EXISTE' ){
        return {
            error : true ,
            message : `El profesor con DNI: ${data.dni_profesor} ya tiene una clase asignada .`,
           
            code : "PROFESOR_OCUPADO"
        };
    };

    const dataAlta = await HorariosData.altaHorario( dataClasesHorario);

    if ( dataAlta.code === 'HORARIOS_CLASES_CREAR') {
        return {
            error : false,
            message : "Horario de clase creado con éxito",
            data : dataAlta.data,
            code : "HORARIO_CREADO_EXITOSAMENTE"
        }
    };

    return {
        error : true ,
        message : `No se pudo crear el horario de clase`,
        code : "HORARIOS_PROBLEMAS" 
    };
};


export const method = {
    calendario : tryCatchDatos( servicioCalendarioHorario ),
    alta       : tryCatchDatos( servicioAltaCalendario )
};