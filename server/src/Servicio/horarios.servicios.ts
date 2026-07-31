// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { registroHistorial } from "../utils/postHistorial";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as HorariosData } from "../data/horarios.data";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import * as TipadoHorario from "../squemas/horarios_clases";
import { ResultCalendarioHorario, ResultadoAltaHorario ,ResultModHorario, ResultEliminarHorario} from "../tipados/horarios";
import { TipadoData } from "../tipados/tipado.data";
import { type HistorialInputs } from "../squemas/historial"; 

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

    if ( calendario.code === 'HORARIOS_CLASES_LISTED'){
        return {
            error: false,
            message: "Calendario de la escuela obtenido correctamente",
            data: calendario.data,
            code: "CALENDARIO_ESCUELA_LISTADO"
        }
    };


    return {
        error: true,
        message: "Error al obtener el calendario",
        code: "ERROR_SERVIDOR"
    };
};


/**
 * Servicio encargado de dar de alta un nuevo horario de clase,
 * validando que la escuela y el profesor no tengan conflictos de horario,
 * realizando la inserción en la capa de datos y registrando el historial correspondiente si es exitoso.
 * 
 * @async
 * @function servicioAltaCalendario
 * @param {TipadoHorario.HorarioClaseInput} data - Datos de entrada que incluyen la escuela, profesor, nivel, tipo de clase, horas, día de la semana y usuario.
 * @returns {Promise<TipadoData<ResultadoAltaHorario>>} Retorna una estructura con el estado de la operación, mensaje descriptivo, código de resultado y los datos del horario creado.
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

            const dataHistorial  : HistorialInputs = {
                id_escuela :  dataClasesHorario.id_escuela ,
                id_usuario :  dataClasesHorario.id_usuario,
                modulo : "HORARIOS",
                accion : "CREAR",
                id_registro: Number(dataAlta.data?.id),
                descripcion: `Se creó el horario de clase para el profesor con DNI: ${dataClasesHorario.dni_profesor} (${dataClasesHorario.hora_inicio} - ${dataClasesHorario.hora_fin}, ${dataClasesHorario.dia_semana})`,
                datos: {
                    id_horario: dataAlta.data?.id,
                    
                    dni_profesor: dataClasesHorario.dni_profesor,
                    id_nivel: dataClasesHorario.id_nivel,
                    id_tipo_clase: dataClasesHorario.id_tipo_clase,
                    hora_inicio: dataClasesHorario.hora_inicio,
                    hora_fin: dataClasesHorario.hora_fin,
                    dia_semana: dataClasesHorario.dia_semana,
                    fecha_creacion: dataClasesHorario.fecha_creacion,
                }
            }; 
            
            await registroHistorial( dataHistorial);   

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
        code : "ERROR_SERVIDOR" 
    };
};


/**
 * Servicio encargado de modificar un horario de clase existente,
 * validando los datos de entrada, realizando la actualización en la capa de datos
 * y registrando el historial correspondiente en caso de éxito.
 * 
 * @async
 * @function servcioModCalendario
 * @param {TipadoHorario.ModHorarioInput} data - Datos de entrada que incluyen el identificador del horario, escuela, usuario, DNI del profesor, nivel y tipo de clase.
 * @returns {Promise<TipadoData<ResultModHorario>>} Retorna una estructura con el estado de la operación, mensaje descriptivo, código de resultado y los datos del horario modificado.
 */

const servcioModCalendario = async ( data : TipadoHorario.ModHorarioInput)
: Promise<TipadoData<ResultModHorario>> =>{

    const dataModHorario : TipadoHorario.ModHorarioInput = TipadoHorario.modHorariosSchema.parse(data);

    const horarioMod = await HorariosData.modHorario(dataModHorario);

    if (horarioMod.code === 'HORARIOS_CLASES_MODIFICAR'){
    
            const dataHistorial  : HistorialInputs = {
                id_escuela :  dataModHorario.id_escuela ,
                id_usuario :  dataModHorario.id_usuario,
                modulo : "HORARIOS",
                accion : "MODIFICAR",
                id_registro: Number(dataModHorario.id),
                descripcion: `Se modificó el horario de clase (ID: ${dataModHorario.id}) para el profesor con DNI: ${dataModHorario.dni_profesor}`,
                datos: {
                    id: dataModHorario.id, 
                    dni_profesor: dataModHorario.dni_profesor,
                    id_nivel: dataModHorario.id_nivel,
                    id_tipo_clase: dataModHorario.id_tipo_clase,
                }
            }; 
            
            await registroHistorial( dataHistorial); 


        return{
            error : false,
            message : `El horario : ${horarioMod.data?.id} se modifico`,
            data : horarioMod.data,
            code : "HORARIO_MODIFICADO_EXITOSAMENTE"
        };
    }

    return {
        error : true ,
        message : `No se logro modificar el horario de clase`,
        code : "ERROR_SERVIDOR"        
    }
};



/**
 * Servicio encargado de gestionar la eliminación o cambio de estado de un horario de clase,
 * validando los datos de entrada, realizando la operación en la capa de datos y registrando 
 * el historial correspondiente en caso de éxito.
 * 
 * @async
 * @function servicioEliminarHorario
 * @param {TipadoHorario.EliminarHorarioInput} data - Datos de entrada que incluyen el identificador del horario, escuela, usuario, nuevo estado y vigencia.
 * @returns {Promise<TipadoData<ResultEliminarHorario>>} Retorna una estructura con el estado de la operación, mensaje descriptivo, código de resultado y los datos del horario procesado.
 */
const servicioEliminarHorario = async ( data : TipadoHorario.EliminarHorarioInput ) 
: Promise<TipadoData<ResultEliminarHorario>> => {
   
    const dataElimnar : TipadoHorario.EliminarHorarioInput = TipadoHorario.EliminarHorarioSchema.parse(data);
   
    const eliminarHorario = await HorariosData.eliminarHorario(dataElimnar);
   
    if ( eliminarHorario.code === "HORARIOS_CLASES_ELIMINAR"){

            const dataHistorial  : HistorialInputs = {
                id_escuela :  dataElimnar.id_escuela ,
                id_usuario :  dataElimnar.id_usuario,
                modulo : "HORARIOS",
                accion : "ELIMINAR",
                id_registro: Number(dataElimnar.id),
                descripcion: `Se actualizó el estado del horario de clase (ID: ${dataElimnar.id}) a estado: ${dataElimnar.estado})`,
                datos: {
                    id: dataElimnar.id,
                    estado: dataElimnar.estado,
                    vigente: dataElimnar.vigente,
                }
            }; 
            
            await registroHistorial( dataHistorial); 

        return {
            error : false,
            message : `El horario : ${eliminarHorario.data?.id}  se elimino`,
            data : eliminarHorario.data,
            code : "HORARIO_ELIMINADO"
        }
    };

    return {
        error : true ,
        message : `No se logro borrar el horario de clase`,
        code : "ERROR_SERVIDOR"        
    }

};


export const method = {
    calendario : tryCatchDatos( servicioCalendarioHorario ),
    alta       : tryCatchDatos( servicioAltaCalendario ),
    mod        : tryCatchDatos( servcioModCalendario ),
    eliminar   : tryCatchDatos( servicioEliminarHorario )
};