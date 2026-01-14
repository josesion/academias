import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

// typados
import { HorarioClaseInput , HorarioCalendarioInput , ModHorarioInput , EliminarHorarioInput, DataHorarioAsistenciaInputs} from "../squemas/horarios_clases";
import { ResultadoAltaHorario , ResultCalendarioHorario , ResultModHorario , ResultEliminarHorario, ResultadoDataHorarioAsitencia} from "../tipados/horarios";
import { TipadoData } from "../tipados/tipado.data"; 


/**
 * verificarHorarioEscuela
 * -----------------------
 * Verifica si existe un horario vigente y activo ocupado dentro de una escuela
 * para un día y rango horario determinados.
 *
 * La validación se utiliza para evitar superposición de horarios
 * dentro de la misma escuela.
 *
 * Reglas aplicadas:
 *  - Filtra por escuela (`id_escuela`)
 *  - Filtra por día de la semana (`dia_semana`)
 *  - Solo considera horarios con estado `activos`
 *  - Solo considera horarios `vigente = true`
 *  - Detecta solapamiento horario:
 *      (hora_inicio < hora_fin_nuevo AND hora_fin > hora_inicio_nuevo)
 *
 * @async
 *
 * @param {HorarioClaseInput} data
 * Objeto con los datos del horario a validar.
 *
 * @param {number} data.id_escuela
 * Identificador de la escuela donde se quiere asignar el horario.
 *
 * @param {string} data.dia_semana
 * Día de la semana en el que se intenta asignar el horario.
 *
 * @param {string} data.hora_inicio
 * Hora de inicio del nuevo horario.
 *
 * @param {string} data.hora_fin
 * Hora de fin del nuevo horario.
 *
 * @returns {Promise<TipadoData<{ id: number }>>}
 * Retorna un objeto TipadoData con:
 *  - `error: true` y `code: 'HORARIOS_CLASES_EXISTE'` si el horario ya está ocupado
 *  - `error: false` y `code: 'HORARIOS_CLASES_NO_EXISTE'` si el horario está disponible
 *
 * @throws {Error}
 * Puede lanzar errores relacionados a la base de datos.
 */



const verificarHorarioEscuela = async( data : HorarioClaseInput)
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
                            )
                            AND vigente = true;`;
    const valores : unknown[] = [ id_escuela, dia_semana, hora_fin, hora_inicio ];  
    
    return await buscarExistenteEntidad<{ id : number}>({
        slqEntidad : sql,
        valores ,
        entidad : "horarios_clases"
    });
};

/**
 * verificarProfesor
 * -----------------
 * Verifica si un profesor ya tiene asignado un horario vigente y activo
 * en un día y rango horario determinados, independientemente de la escuela.
 *
 * Esta validación se utiliza para evitar que un profesor tenga
 * superposición de clases en el mismo día y horario.
 *
 * Reglas aplicadas:
 *  - Filtra por profesor (`dni_profesor`)
 *  - Filtra por día de la semana (`dia_semana`)
 *  - Solo considera horarios con estado `activos`
 *  - Solo considera horarios `vigente = true`
 *  - Detecta solapamiento horario:
 *      (hora_inicio < hora_fin_nuevo AND hora_fin > hora_inicio_nuevo)
 *
 * @async
 *
 * @param {HorarioClaseInput} data
 * Objeto con los datos del horario a validar.
 *
 * @param {string} data.dni_profesor
 * Documento del profesor al que se le quiere asignar el horario.
 *
 * @param {string} data.dia_semana
 * Día de la semana en el que se intenta asignar el horario.
 *
 * @param {string} data.hora_inicio
 * Hora de inicio del nuevo horario.
 *
 * @param {string} data.hora_fin
 * Hora de fin del nuevo horario.
 *
 * @returns {Promise<TipadoData<{ id: number }>>}
 * Retorna un objeto TipadoData con:
 *  - `error: true` y `code: 'HORARIOS_PROFESOR_EXISTE'` si el profesor ya está ocupado
 *  - `error: false` y `code: 'HORARIOS_PROFESOR_NO_EXISTE'` si el profesor está disponible
 *
 * @throws {Error}
 * Puede lanzar errores relacionados a la base de datos.
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
                            )
                             AND vigente = true ;`;
    const valores : unknown[] = [ dni_profesor, dia_semana, hora_fin, hora_inicio ];  
    
    return await buscarExistenteEntidad<{ id : number}>({
        slqEntidad : sql,
        valores ,
        entidad : "horarios_profesor"
    });
};



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

/**
 * calendarioEscuela
 * -----------------
 * Obtiene el calendario de horarios de una escuela determinada.
 *
 * Reglas de negocio aplicadas:
 *  - Solo se devuelven horarios **vigentes** (`vigente = true`)
 *  - Solo se incluyen horarios con estado:
 *      - 'activos'
 *      - 'suspendido'
 *  - No incluye horarios inactivos ni no vigentes
 *
 * La información retornada está pensada para:
 *  - Visualización de calendario
 *  - Asignación de clases
 *  - Consulta operativa
 *
 * @async
 *
 * @param {HorarioCalendarioInput} datos
 * Objeto de entrada con:
 *  - id_escuela: number → Escuela sobre la cual se consulta el calendario
 *  - estado: string → Usado únicamente para mensajes de respuesta (TipadoData)
 *
 * @returns {Promise<TipadoData<ResultCalendarioHorario[]>>}
 * Retorna una promesa con:
 *  - error: boolean
 *  - message: string
 *  - data: Array de horarios con:
 *      - id_horario
 *      - profesor (apellido)
 *      - nivel
 *      - tipo_clase
 *      - dia
 *      - hora_inicio
 *      - hora_fin
 *      - estado
 *  - code: string
 *
 * @throws {Error}
 * Puede lanzar errores relacionados a:
 *  - Acceso a base de datos
 *  - Fallas internas del servicio
 */


const calendarioEscuela = async( datos : HorarioCalendarioInput)
: Promise<TipadoData<ResultCalendarioHorario[]>> =>{
    const { id_escuela, estado } = datos;
    const sql : string = `SELECT 
                            hc.id AS id_horario,

                            p.apellido AS profesor,
							p.dni      as dni_profe,
                            p.nombre as nombre,
                            
                            n.nivel AS nivel,
                            n.id    as id_nivel,
                            
                            tc.tipo AS tipo_clase,
							tc.id   as id_clase , 
                            hc.dia_semana as dia,
                            hc.hora_inicio,
                            hc.hora_fin,
                            hc.estado

                        FROM horarios_clases hc

                        JOIN profesores_en_escuela pe
                            ON pe.dni_profesor = hc.dni_profesor
                        AND pe.id_escuela = hc.id_escuela

                        JOIN profesores p
                            ON p.dni = hc.dni_profesor

                        JOIN niveles n
                            ON n.id = hc.id_nivel

                        JOIN tipo_clase tc
                            ON tc.id = hc.id_tipo_clase

                        JOIN escuelas e
                            ON e.id_escuela = hc.id_escuela

                        WHERE hc.id_escuela = ? 
                        AND hc.estado IN ('activos', 'suspendido')
                        And hc.vigente = true ;`;

    const valores : unknown[] = [id_escuela];

    return await listarEntidadSinPaginacion<ResultCalendarioHorario>({
        slqListado : sql,
        valores ,
        entidad : "horarios_clases" ,
        estado : estado
    });
};

/**
 * Modifica un horario de clase existente.
 *
 * Actualiza los datos del profesor, tipo de clase y nivel
 * asociados a un horario dentro de una escuela específica.
 *
 * @async
 * @function modHorario
 *
 * @param {ModHorarioInput} datos - Datos necesarios para modificar el horario.
 * @param {number} datos.dni_profesor - DNI del profesor asignado al horario.
 * @param {number} datos.id_tipo_clase - Identificador del tipo de clase.
 * @param {number} datos.id_nivel - Identificador del nivel educativo.
 * @param {number} datos.id_escuela - Identificador de la escuela.
 * @param {number} datos.id - Identificador único del horario a modificar.
 *
 * @returns {Promise<TipadoData<ResultModHorario>>}
 * Promesa que retorna un objeto tipado con el resultado de la modificación
 * del horario en la entidad `horarios_clases`.
 *
 * @throws {Error}
 * Lanza un error si ocurre un problema durante la actualización
 * en la base de datos.
 *
 * @example
 * ```ts
 * const resultado = await modHorario({
 *   id: 10,
 *   id_escuela: 3,
 *   dni_profesor: 30123456,
 *   id_tipo_clase: 2,
 *   id_nivel: 1
 * });
 * ```
 */


const modHorario = async ( datos : ModHorarioInput ) 
: Promise<TipadoData<ResultModHorario>> => {
    const {dni_profesor , id_tipo_clase , id_nivel, id_escuela , id } = datos ;

    const sql : string = `UPDATE horarios_clases
                        SET
                            dni_profesor   =  ?,
                            id_tipo_clase  =  ?,
                            id_nivel       =  ?
                        WHERE id = ?
                        AND id_escuela =  ?;`;

    const valores : unknown[] = [ dni_profesor , id_tipo_clase , id_nivel, id, id_escuela  ];

    const datosRetorno = { dni_profesor , id_nivel , id_tipo_clase , id, id_escuela };

    return await iudEntidad<ResultModHorario>({
        slqEntidad : sql ,
        valores,
        datosRetorno, 
        entidad : "horarios_clases",
        metodo : "MODIFICAR"
    }); 

};

/**
 * Elimina lógicamente un horario de clase.
 *
 * Actualiza los campos `estado` y `vigente` de un horario existente,
 * permitiendo desactivarlo sin eliminar el registro físicamente
 * de la base de datos.
 *
 * @async
 * @function eliminarHorario
 *
 * @param {EliminarHorarioInput} data - Datos necesarios para eliminar el horario.
 * @param {number} data.id - Identificador único del horario.
 * @param {number} data.id_escuela - Identificador de la escuela.
 * @param {number | boolean} data.estado - Estado del horario (activo/inactivo).
 * @param {number | boolean} data.vigente - Indica si el horario se encuentra vigente.
 *
 * @returns {Promise<TipadoData<ResultEliminarHorario>>}
 * Promesa que retorna un objeto tipado con el resultado de la eliminación lógica
 * del horario en la entidad `horarios_clases`.
 *
 * @throws {Error}
 * Lanza un error si ocurre un problema durante la actualización
 * en la base de datos.
 *
 * @example
 * ```ts
 * const resultado = await eliminarHorario({
 *   id: 12,
 *   id_escuela: 3,
 *   estado: inactivos,
 *   vigente: 0
 * });
 * ```
 */


const eliminarHorario = async ( data : EliminarHorarioInput)
: Promise<TipadoData<ResultEliminarHorario>> =>{
    const  { estado , vigente, id_escuela , id } = data ;
    const sql : string = `UPDATE horarios_clases
                            SET
                                estado         =  ?,
                                vigente        =  ?
                            WHERE id = ?
                            AND id_escuela = ?;` ;

    const datosRetorno = {id , id_escuela, estado , vigente };
    const valores : unknown[] = [ estado , vigente , id , id_escuela];

    return await iudEntidad<ResultEliminarHorario>({
        slqEntidad : sql,
        valores ,
        datosRetorno ,
        entidad : "horarios_clases",
        metodo : "ELIMINAR"
    });

};

/**
 * Consulta en la base de datos el horario de clase disponible en el momento actual.
 * * Esta función ejecuta una consulta SQL compleja que valida si existe una clase
 * cuya ventana de acreditación coincida con la hora del servidor (NOW()).
 * * @param {DataHorarioAsistenciaInputs} data
 * Objeto con los criterios de filtrado:
 * - id_escuela: Identificador de la institución.
 * - estado: Estado de la clase (ej: 'activos').
 * - dia: Nombre del día de la semana (ej: 'lunes').
 * * @returns {Promise<TipadoData<ResultadoDataHorarioAsitencia>>}
 * Retorna una promesa con el resultado de `buscarExistenteEntidad`:
 * - Si encuentra clase: Retorna el código de éxito y los datos del horario.
 * - Si no encuentra: Retorna el código de entidad no existente.
 * * @remarks
 * - La consulta utiliza `SUBTIME` y `ADDTIME` para crear una ventana de tiempo
 * de 45 minutos en total (15 antes del inicio y 30 después del inicio).
 * - Maneja casos especiales de clases que inician cerca de la medianoche.
 * - Se delega la ejecución a la función genérica `buscarExistenteEntidad`.
 * * @sqlLogic
 * La ventana de tiempo se calcula exclusivamente sobre `hc.hora_inicio`:
 * - Límite Inferior: hora_inicio - 15 minutos.
 * - Límite Superior: hora_inicio + 30 minutos.
 */
const dataHorarioAsistencia = async( data : DataHorarioAsistenciaInputs ) 
:Promise<TipadoData<ResultadoDataHorarioAsitencia>> => {
    const { id_escuela, estado, dia} = data;

    const sql : string = `SELECT 
                                hc.id AS id_horario_en_clase,
                                hc.hora_inicio,
                                hc.hora_fin,
                                tc.tipo AS nombre_clase
                                
                            FROM horarios_clases hc
                            INNER JOIN tipo_clase tc 
                                ON tc.id = hc.id_tipo_clase
                            WHERE
                                hc.id_escuela = ?
                                AND hc.estado = ?
                                AND hc.vigente = 1
                                AND hc.dia_semana = ?
                                AND (
                                    -- CASO A: Horario estándar (no cruza medianoche)
                                    (
                                        hc.hora_inicio < hc.hora_fin
                                        AND CAST(NOW() AS TIME) BETWEEN SUBTIME(hc.hora_inicio, '00:15:00') 
                                                                AND ADDTIME(hc.hora_inicio, '00:30:00')
                                    )
                                    OR
                                    -- CASO B: La clase empieza cerca de medianoche (ej: 00:05)
                                    (
                                        hc.hora_inicio > hc.hora_fin
                                        AND (
                                            CAST(NOW() AS TIME) >= SUBTIME(hc.hora_inicio, '00:15:00')
                                            OR CAST(NOW() AS TIME) <= ADDTIME(hc.hora_inicio, '00:30:00')
                                        )
                                    )
                                );`;
    const valores : unknown[] = [ id_escuela, estado , dia ];
    return await buscarExistenteEntidad<ResultadoDataHorarioAsitencia>({
        slqEntidad : sql,
        valores,
        entidad : "horario_asistencia"
    });
};

export const method = {
    altaHorario : tryCatchDatos( altaHorario ),
    modHorario  : tryCatchDatos ( modHorario ),
    eliminarHorario : tryCatchDatos( eliminarHorario ),
    verificarHorarioEscuela : tryCatchDatos( verificarHorarioEscuela ),
    verificarProfesor : tryCatchDatos( verificarProfesor ),
    listaCalendario   : tryCatchDatos( calendarioEscuela),
    dataHorarioAsistencia : tryCatchDatos( dataHorarioAsistencia),
};