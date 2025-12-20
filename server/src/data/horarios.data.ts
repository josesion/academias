import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

// typados
import { HorarioClaseInput , HorarioCalendarioInput} from "../squemas/horarios_clases";
import { ResultadoAltaHorario , ResultCalendarioHorario } from "../tipados/horarios";
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

                            n.nivel AS nivel,
                            tc.tipo AS tipo_clase,

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

export const method = {
    altaHorario : tryCatchDatos( altaHorario ),
    verificarHorarioEscuela : tryCatchDatos( verificarHorarioEscuela ),
    verificarProfesor : tryCatchDatos( verificarProfesor ),
    listaCalendario   : tryCatchDatos( calendarioEscuela)
};