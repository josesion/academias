// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
//import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";
import pool from "../bd";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { TipadoData } from "../tipados/tipado.data"; 
import { ResultadoClaseEnCruso, ResultadoClaseProxima } from "../tipados/asistencia.tipado";
import { VerificarInscripcionInput } from "../squemas/inscripciones";
import { AsistenciaInputs, ClasesActualInputs, ClasesProximaInputs} from "../squemas/asistencias";

const vencerInscripciones = async () => {
  const sql = `
    UPDATE inscripciones
    SET estado = 'vencidos'
    WHERE id_inscripcion > 0
    AND estado = 'activos'
    AND fecha_fin < CURDATE();
  `;

  await pool.execute(sql);
};

/**
 * Verifica si una inscripción existe y se encuentra en el estado esperado.
 *
 * Esta función consulta la tabla `inscripciones` para validar que:
 * - La inscripción exista
 * - Corresponda al alumno indicado
 * - Pertenezca a la escuela indicada
 * - Se encuentre en el estado esperado (ej: 'activos')
 *
 * Se utiliza principalmente como **paso previo** antes de registrar una asistencia,
 * para evitar operar sobre inscripciones vencidas o inexistentes.
 *
 * @param {VerificarInscripcionInput} data
 * Objeto con los datos necesarios para verificar la inscripción.
 * @param {number} data.id_inscripcion - ID de la inscripción.
 * @param {number} data.dni_alumno - DNI del alumno.
 * @param {number} data.id_escuela - ID de la escuela.
 * @param {string} data.estado - Estado esperado de la inscripción (ej: 'activos').
 *
 * @returns {Promise<TipadoData<number>>}
 * Retorna un objeto tipado con el resultado de la verificación.
 *
 * @returns.code INSCRIPCION_EXISTE - La inscripción existe y cumple las condiciones.
 * @returns.code INSCRIPCION_NO_EXISTE - La inscripción no existe o no cumple las condiciones.
 *
 * @remarks
 * - Internamente utiliza `buscarExistenteEntidad`.
 * - El `SELECT 1` se usa solo como verificación de existencia.
 * - No retorna datos de la inscripción, solo confirma su existencia.
 */

const estadoInscripcion =async ( data : VerificarInscripcionInput) 
: Promise<TipadoData<number>> =>{
    const { id_inscripcion, dni_alumno, id_escuela, estado } = data;

    const sql : string = `SELECT 1
                            FROM inscripciones
                            WHERE id_inscripcion = ?
                            AND dni_alumno = ?
                            AND id_escuela = ?
                            AND estado = ?
                          LIMIT 1;`;

                
   const valores : unknown[] = [ id_inscripcion , dni_alumno, id_escuela, estado];                       
   return await buscarExistenteEntidad<number>({
       slqEntidad : sql,
       valores, 
       entidad : "inscripcion"
   }); 
};

/**
 * Verifica si un alumno ya registró asistencia en un horario específico
 * en el día actual.
 *
 * Esta función se utiliza para **evitar doble asistencia** del mismo alumno
 * en una misma clase y fecha.
 *
 * La validación se realiza sobre:
 * - La inscripción
 * - El horario de la clase
 * - La fecha actual (CURDATE)
 *
 * Si existe un registro, significa que el alumno **ya se encuentra en clase**
 * o ya marcó asistencia previamente.
 *
 * @param {number} id_inscripcion - ID de la inscripción del alumno.
 * @param {number} id_horario_clase - ID del horario de la clase.
 *
 * @returns {Promise<TipadoData<number>>}
 * Retorna un objeto tipado con el resultado de la verificación.
 *
 * @returns.code ASISTENCIA_EXISTE - Ya existe una asistencia registrada para hoy.
 * @returns.code ASISTENCIA_NO_EXISTE - No hay asistencia registrada para hoy.
 *
 * @remarks
 * - Internamente utiliza `buscarExistenteEntidad`.
 * - El `SELECT 1` se usa únicamente para validar existencia.
 * - La validación por `CURDATE()` asegura que solo se controle el día actual.
 * - Esta función debe ejecutarse **antes** de intentar insertar una asistencia.
 */
const dobleAsitencia = async( id_inscripcion : number , id_horario_clase: number )
: Promise<TipadoData<number>> =>{
    const sql : string =`SELECT 1
                        FROM asistencias
                        WHERE id_inscripcion = ?
                        AND id_horario_clase = ?
                        AND fecha = CURDATE()
                        LIMIT 1;`; 
    const valores : unknown[]  = [ id_inscripcion , id_horario_clase];
    return await buscarExistenteEntidad<number>({
        slqEntidad : sql,
        valores ,
        entidad : "asistencia"
    });
};

/**
 * Verifica si un horario de clase se encuentra dentro de la ventana
 * de tiempo permitida para registrar asistencia.
 *
 * La ventana válida se calcula en base a la hora de inicio del horario:
 * - Desde 15 minutos antes del inicio de la clase
 * - Hasta 30 minutos después del inicio de la clase
 *
 * Si la hora actual (`NOW()`) se encuentra dentro de ese rango,
 * la función considera que el horario es válido para marcar asistencia.
 *
 * @param {number} id_horario_clase - ID del horario de clase a validar.
 *
 * @returns {Promise<TipadoData<number>>}
 * Retorna un objeto tipado indicando si el horario es válido o no.
 *
 * @returns.code HORARIO_EXISTE - El horario existe y está dentro de la ventana permitida.
 * @returns.code HORARIO_NO_EXISTE - El horario no existe o está fuera de la ventana horaria.
 *
 * @remarks
 * - La validación se realiza completamente en base de datos.
 * - Se utiliza `SELECT 1` únicamente para comprobar existencia.
 * - `hora_inicio` se castea a TIME para poder construir un TIMESTAMP con la fecha actual.
 * - `DATE_SUB` y `DATE_ADD` definen el margen de tolerancia alrededor del horario.
 * - Si no se devuelve ninguna fila, se interpreta como fuera de la ventana permitida.
 *
 * @example
 * // Ejemplo conceptual de ventana:
 * // Clase a las 21:00
 * // Ventana válida: 20:45 → 21:30
 */
const ventanaAsistencia = async( id_horario_clase : number) 
: Promise<TipadoData<number>> =>{
    const sql : string = `SELECT 1
                            FROM horarios_clases
                            WHERE id = ?
                            AND NOW() BETWEEN
                            DATE_SUB(
                                TIMESTAMP(CURDATE(), CAST(hora_inicio AS TIME)),
                                INTERVAL 15 MINUTE
                            )
                            AND
                            DATE_ADD(
                                TIMESTAMP(CURDATE(), CAST(hora_inicio AS TIME)),
                                INTERVAL 30 MINUTE
                            )
                            LIMIT 1;`;
    const valores : unknown[] = [id_horario_clase];
    return await buscarExistenteEntidad({
        slqEntidad : sql ,
        valores ,
        entidad : "horario"
    });  
};

/**
 * Registra una asistencia para un alumno en una clase específica y
 * actualiza el estado de la inscripción si corresponde.
 *
 * Esta operación se ejecuta dentro de una transacción para garantizar
 * la integridad de los datos.
 *
 * Flujo interno:
 * 1. Inserta la asistencia del alumno para el día actual (CURDATE).
 * 2. Calcula la cantidad de clases restantes de la inscripción.
 * 3. Si las clases restantes llegan a 0 o menos, marca la inscripción como "vencidos".
 * 4. Confirma la transacción si todo sale bien, o hace rollback ante cualquier error.
 *
 * @param {VerificarInscripcionInput} verificacion
 * Datos necesarios para validar la inscripción activa del alumno.
 * Incluye:
 * - id_escuela
 * - dni_alumno
 * - id_inscripcion
 *
 * @param {AsistenciaInputs} asistencia
 * Datos propios de la asistencia a registrar.
 * Incluye:
 * - id_horario_clase
 *
 * @returns {Promise<TipadoData<{ idAsistencia: number, clasesRestantes: number }>>}
 * Retorna un objeto tipado con el resultado de la operación.
 *
 * @returns.code TRANSACCION_OK
 * La asistencia fue registrada correctamente.
 * Se devuelve:
 * - idAsistencia: ID generado de la asistencia
 * - clasesRestantes: cantidad de clases disponibles luego del registro
 *
 * @returns.code TRANSACCION_FALLIDA
 * Ocurrió un error durante la transacción y no se aplicaron cambios.
 *
 * @remarks
 * - La función asume que todas las validaciones previas ya fueron realizadas:
 *   - Inscripción existente y activa
 *   - No doble asistencia en el mismo día
 *   - Horario dentro de la ventana permitida
 * - La lógica de vencimiento de inscripción depende exclusivamente
 *   del cálculo de clases restantes.
 * - El uso de transacciones evita estados inconsistentes ante errores intermedios.
 *
 * @example
 * // Resultado exitoso
 * {
 *   error: false,
 *   message: "Asistencia registrada correctamente",
 *   data: {
 *     idAsistencia: 123,
 *     clasesRestantes: 5
 *   },
 *   code: "TRANSACCION_OK"
 * }
 */
const asistenciaAlta = async( verificacion : VerificarInscripcionInput, asistencia : AsistenciaInputs ) 
: Promise<TipadoData<{idAsistencia : number, clasesRestantes : number}>>=>{

    const {id_escuela, dni_alumno, id_inscripcion} = verificacion;
    const { id_horario_clase} = asistencia;

    const sqlInsertarAsistencia : string = `INSERT INTO asistencias (
                                                id_escuela,
                                                dni_alumno,
                                                id_inscripcion,
                                                id_horario_clase,
                                                fecha,
                                                estado
                                            )
                                            VALUES (
                                                ?, ?, ?, ?, CURDATE(), 'presente'
                                            );`;

    const sqlClasesRestantes : string = `SELECT
                                            i.id_inscripcion,
                                            (i.clases_asignadas_inscritas * i.meses_asignados_inscritos)
                                                - COUNT(a.id_asistencia) AS clases_restantes
                                            FROM inscripciones i
                                            LEFT JOIN asistencias a
                                            ON a.id_inscripcion = i.id_inscripcion
                                            AND a.estado = 'presente'
                                            WHERE i.id_inscripcion = ?
                                            GROUP BY i.id_inscripcion;`; 

    const sqlActualizarIncripcion : string = `UPDATE inscripciones 
                                                SET estado = 'vencidos'
                                                WHERE id_inscripcion = ?`;                                      
                                            
    const valoresInsertarAsistencia : unknown[] = [id_escuela , dni_alumno , id_inscripcion , id_horario_clase  ];
    const valoresClasesRestantes : unknown[] = [id_inscripcion];
    const valoresActualizarInscripcion : unknown[] = [id_inscripcion];

    const resultado = await iudEntidadTransaction(async(conn)=>{
        // se da la asistencia
        const [resAsistencia] = await conn.execute(sqlInsertarAsistencia,valoresInsertarAsistencia);   
        // se calcula la clases q qeunda
        const [resClas] = await conn.execute(sqlClasesRestantes,valoresClasesRestantes);
        const clasesRestantes = (resClas as any)[0]?.clases_restantes ?? 0;
        // si las clases es 0  acltualizo la insc para darla como vencida
        if(clasesRestantes <= 0){
           await conn.execute(sqlActualizarIncripcion, valoresActualizarInscripcion);
        };
        return{
            idAsistencia :(resAsistencia as any).insertId,
            clasesRestantes
        }
    } );

    if (resultado.code ===  "TRANSACCION_OK" ){
        return {
            error : false,
            message : "Asistencia registrada correctamente",
            data : resultado.data,
            code : "TRANSACCION_OK"
        };
    };

    return {
            error : true,
            message : "Transaccion fallida",
            code : "TRANSACCION_FALLIDA"
    };

};

/**
 * Obtiene la clase que se encuentra actualmente en curso para una escuela.
 *
 * La función consulta los horarios de clases y determina si existe una clase
 * activa en este momento, considerando:
 * - Escuela
 * - Estado del horario
 * - Día de la semana
 * - Rango horario actual
 *
 * Soporta correctamente:
 * - Rangos normales (ej: 09:00 → 11:00)
 * - Rangos que cruzan la medianoche (ej: 23:00 → 01:00)
 *
 * La comparación horaria se realiza contra la hora actual del servidor (`NOW()`).
 *
 * @param data - Datos necesarios para la verificación de clase en curso.
 * @param data.id_escuela - Identificador de la escuela.
 * @param data.estado - Estado del horario (ej: activo/inactivo).
 * @param data.dia - Día de la semana en texto (ej: "lunes", "martes").
 *
 * @returns Promesa con un objeto `TipadoData` que contiene:
 * - `data`: Información de la clase en curso si existe.
 * - `code`: Código de resultado de la consulta.
 * - `message`: Mensaje descriptivo del resultado.
 *
 * @example
 * ```ts
 * const resultado = await clase_en_curso({
 *   id_escuela: 3,
 *   estado: "activo",
 *   dia: "lunes"
 * });
 *
 * if (resultado.code === "CLASE_EN_CURSO_EXISTE") {
 *   console.log(resultado.data);
 * }
 * ```
 */
const clase_en_curso = async( data : ClasesActualInputs) 
: Promise<TipadoData<ResultadoClaseEnCruso>> =>{
    const { id_escuela , estado, dia } = data ;
    const sql : string = `select id as id_horario_en_clase, hora_inicio, hora_fin from horarios_clases
                            where
                                id_escuela = ? and estado = ? and vigente = 1  and dia_semana = ?
                                and  (
                                    -- CASO A: Rango normal (ej: 09:00 a 11:00)
                                    (hora_inicio < hora_fin AND CAST(NOW() AS TIME) BETWEEN CAST(hora_inicio AS TIME) AND CAST(hora_fin AS TIME))
                                    OR
                                    -- CASO B: Rango que cruza medianoche (ej: 23:00 a 01:00)
                                    (hora_inicio > hora_fin AND (CAST(NOW() AS TIME) >= CAST(hora_inicio AS TIME) OR CAST(NOW() AS TIME) <= CAST(hora_fin AS TIME)))
                                );`;
    const valores : unknown[] = [id_escuela , estado , dia];
    return await buscarExistenteEntidad<ResultadoClaseEnCruso>({
        slqEntidad : sql,
        valores,
        entidad : "clase_en_curso"
    });
};

/**
 * Obtiene la próxima clase a dictarse para una escuela en el día actual.
 *
 * La función busca el siguiente horario de clase cuya hora de inicio
 * sea posterior a la hora actual del servidor (`NOW()`), teniendo en cuenta:
 * - Escuela
 * - Estado del horario
 * - Vigencia
 * - Día de la semana
 *
 * El resultado se ordena por hora de inicio ascendente y se limita
 * a una única clase (la más próxima).
 *
 *  Consideraciones:
 * - Solo evalúa clases del mismo día (`dia_semana`).
 * - No contempla clases que comiencen al día siguiente.
 * - Asume que no existen horarios superpuestos.
 *
 * @param data - Datos necesarios para la búsqueda de la próxima clase.
 * @param data.id_escuela - Identificador de la escuela.
 * @param data.estado - Estado del horario (ej: activo/inactivo).
 * @param data.dia - Día de la semana en texto (ej: "lunes", "martes").
 *
 * @returns Promesa con un objeto `TipadoData` que contiene:
 * - `data`: Información de la próxima clase si existe.
 * - `code`: Código de resultado de la consulta.
 * - `message`: Mensaje descriptivo del resultado.
 *
 * @example
 * ```ts
 * const resultado = await clase_proxima_clase({
 *   id_escuela: 3,
 *   estado: "activo",
 *   dia: "lunes"
 * });
 *
 * if (resultado.code === "PROXIMA_CLASE_EXISTE") {
 *   console.log(resultado.data);
 * }
 * ```
 */
const clase_proxima_clase = async( data : ClasesProximaInputs) 
: Promise<TipadoData<ResultadoClaseProxima>>  =>{
    const { id_escuela , estado, dia } = data ;  
    const sql : string = `SELECT id as id_horario_prox_clase, hora_inicio, hora_fin FROM horarios_clases
                            WHERE 
                                id_escuela = ? 
                                AND estado = ? 
                                AND vigente = 1
                                and dia_semana = ?
                                AND CAST(hora_inicio AS TIME) > CAST(NOW() AS TIME)
                            ORDER BY 
                                CAST(hora_inicio AS TIME) ASC
                            LIMIT 1;`;

    const valores : unknown[] = [id_escuela , estado, dia];
    return await buscarExistenteEntidad<ResultadoClaseProxima>({
        slqEntidad : sql ,
        valores,
        entidad : "proxima_clase"
    });
};

export const method = {
    verificarInscripcion : tryCatchDatos( estadoInscripcion ),
    dobleAsitencia  : tryCatchDatos( dobleAsitencia ),
    ventanaAsistencia : tryCatchDatos( ventanaAsistencia ),
    asistencia : tryCatchDatos( asistenciaAlta ),
    vencerInscripciones : tryCatchDatos( vencerInscripciones),
    claseEnCurso : tryCatchDatos( clase_en_curso ),
    proximaClase : tryCatchDatos( clase_proxima_clase ),
};