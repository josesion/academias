import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";

// typados
import { HorarioClaseInput } from "../squemas/horarios_clases";

import { TipadoData } from "../tipados/tipado.data"; 


/**
 * verificarHorario
 * ----------------
 * Verifica si ya existe un horario activo en una escuela
 * que se superponga con el rango horario recibido.
 *
 * Regla de negocio:
 * - Una escuela solo puede tener una clase activa a la vez
 *   (no se permiten solapamientos de horarios).
 * - La validación se hace por:
 *   • id_escuela
 *   • día de la semana
 *   • rango horario (hora_inicio / hora_fin)
 *
 * Se considera conflicto cuando:
 *   hora_inicio_existente < hora_fin_nueva
 *   AND
 *   hora_fin_existente > hora_inicio_nueva
 *
 * @async
 * @function verificarHorario
 *
 * @param {HorarioClaseInput} data
 * Objeto con los datos del horario a validar.
 *
 * @param {number} data.id_escuela
 * Identificador de la escuela donde se intenta crear el horario.
 *
 * @param {string} data.dia_semana
 * Día de la semana (lunes a domingo).
 *
 * @param {string} data.hora_inicio
 * Hora de inicio del horario (formato HH:mm).
 *
 * @param {string} data.hora_fin
 * Hora de fin del horario (formato HH:mm).
 *
 * @returns {Promise<TipadoData<{ id: number }>>}
 * Retorna un objeto TipadoData:
 * - Si existe un horario en conflicto → code: 'HORARIOS_CLASES_EXISTE'
 * - Si no existe conflicto → resultado vacío / sin error
 *
 * @example
 * await verificarHorario({
 *   id_escuela: 107,
 *   dia_semana: 'miercoles',
 *   hora_inicio: '08:00',
 *   hora_fin: '09:00'
 * });
 */

const verificarHorario = async( data : HorarioClaseInput)
: Promise<TipadoData<{ id : number}>> =>{
    const {id_escuela, dia_semana, hora_inicio, hora_fin} = data;

    const sql : string =`SELECT id
                         FROM horarios_clases
                         WHERE
                            id_escuela = ?
                            AND dia_semana = ?
                            AND estado = 'activos'
                            AND (
                                (hora_inicio < ? AND hora_fin > ?)
                            );`;
    const valores : unknown[] = [ id_escuela, dia_semana, hora_fin, hora_inicio ];  
    
    return await buscarExistenteEntidad<{ id : number}>({
        slqEntidad : sql,
        valores ,
        entidad : "horarios_clases"
    });
};

/**
 * verificarProfesor
 * ------------------
 * Valida si un profesor ya tiene asignada una clase en el mismo día y
 * en un rango horario que se superpone, sin importar la escuela.
 *
 * Esta verificación es **global**, y se usa para cumplir la regla de negocio:
 * un profesor no puede dictar dos clases al mismo tiempo, aunque sean
 * en academias distintas.
 *
 * La validación se considera positiva si existe al menos un horario:
 *  - Con el mismo dni_profesor
 *  - En el mismo día de la semana
 *  - En estado "activos"
 *  - Con superposición de horario:
 *      (hora_inicio < nueva_hora_fin AND hora_fin > nueva_hora_inicio)
 *
 * @async
 * @function verificarProfesor
 *
 * @param {HorarioClaseInput} data
 *        Objeto con los datos del horario que se intenta crear.
 *        Se utilizan las propiedades:
 *        - dni_profesor
 *        - dia_semana
 *        - hora_inicio
 *        - hora_fin
 *
 * @returns {Promise<TipadoData<{ id: number }>>}
 *          Retorna un objeto TipadoData indicando:
 *          - Si existe un horario que genera conflicto (`HORARIOS_PROFESOR_EXISTE`)
 *          - O si el profesor está disponible en ese horario
 *
 * @example
 * const resultado = await verificarProfesor({
 *   dni_profesor: "33762578",
 *   dia_semana: "miercoles",
 *   hora_inicio: "08:00",
 *   hora_fin: "09:00",
 *   id_escuela: 107,
 *   id_nivel: 2,
 *   id_tipo_clase: 1,
 *   fecha_creacion: "2025-12-13",
 *   estado: "activos"
 * });
 */

const verificarProfesor = async( data : HorarioClaseInput)
: Promise<TipadoData<{ id : number}>> =>{
    const {dni_profesor, dia_semana, hora_inicio, hora_fin} = data;

    const sql : string =`SELECT id
                         FROM horarios_clases
                         WHERE
                             dni_profesor = ?
                            AND dia_semana = ?
                            AND estado = 'activos'
                            AND (
                                (hora_inicio < ? AND hora_fin > ?)
                            );`;
    const valores : unknown[] = [ dni_profesor, dia_semana, hora_fin, hora_inicio ];  
    
    return await buscarExistenteEntidad<{ id : number}>({
        slqEntidad : sql,
        valores ,
        entidad : "horarios_profesor"
    });
};


interface ResultadoAltaHorario {
    id_escuela: number;
    dni_profesor: string;
    id_nivel: number;
    id_tipo_clase: number; 
}

/**
 * Crea un nuevo horario de clase en la base de datos.
 *
 * Este método asume que:
 * - Ya se validó que la escuela no tenga otro horario ocupado.
 * - Ya se validó que el profesor no esté ocupado globalmente.
 *
 * @async
 * @function altaHorario
 *
 * @param {HorarioClaseInput} datos
 * Datos completos del horario a crear.
 *
 * @param {number} datos.id_escuela
 * ID de la escuela donde se dicta la clase.
 *
 * @param {string} datos.dni_profesor
 * DNI del profesor asignado.
 *
 * @param {number} datos.id_nivel
 * ID del nivel de la clase (principiante, intermedio, etc.).
 *
 * @param {number} datos.id_tipo_clase
 * ID del tipo de clase (bachata, salsa, etc.).
 *
 * @param {string} datos.dia_semana
 * Día de la semana en que se dicta la clase.
 *
 * @param {string} datos.hora_inicio
 * Hora de inicio de la clase (HH:mm).
 *
 * @param {string} datos.hora_fin
 * Hora de fin de la clase (HH:mm).
 *
 * @param {string} datos.fecha_creacion
 * Fecha de creación del registro.
 *
 * @param {string} datos.estado
 * Estado del horario (activos, inactivos, suspendido).
 *
 * @returns {Promise<TipadoData<ResultadoAltaHorario>>}
 * Retorna un objeto TipadoData con:
 * - Los datos principales del horario creado.
 * - Código de operación correspondiente al alta.
 */

const altaHorario = async( datos : HorarioClaseInput ) 
: Promise<TipadoData<ResultadoAltaHorario>> =>{

    const {id_escuela,dni_profesor, id_nivel, id_tipo_clase,
        dia_semana, hora_inicio, hora_fin, fecha_creacion, estado
    } = datos;

    const sql : string =`INSERT INTO horarios_clases (
                                id_escuela, dni_profesor, id_nivel, id_tipo_clase,
                                dia_semana, hora_inicio, hora_fin, fecha_creacion, estado)
                         VALUES
                            ( ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const valores : unknown[] = [id_escuela ,dni_profesor, id_nivel, id_tipo_clase,
                                 dia_semana, hora_inicio, hora_fin, fecha_creacion, estado];
    const datosADevolver = {
        id_escuela,
        dni_profesor,   
        id_nivel,
        id_tipo_clase
    };

    return await iudEntidad<ResultadoAltaHorario>({
        slqEntidad : sql,
        valores ,
        entidad : "horarios_clases",
        metodo : "CREAR",
        datosRetorno : datosADevolver
    });                            
};



export const method = {
    altaHorario : tryCatchDatos( altaHorario ),
    verificarHorario : tryCatchDatos( verificarHorario ),
    verificarProfesor : tryCatchDatos( verificarProfesor ),
};