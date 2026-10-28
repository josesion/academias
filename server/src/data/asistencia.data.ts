// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
//import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import { listarEntidad } from "../hooks/funcionListar";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";
import pool from "../bd";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { TipadoData } from "../tipados/tipado.data"; 
import { ResultadoClaseEnCruso, ResultadoClaseProxima, } from "../tipados/asistencia.tipado";

import { VerificarInscripcionInput } from "../squemas/inscripciones";
import { AsistenciaInputs, ClasesActualInputs, ClasesProximaInputs, InfoAlumnoInputs, HorarioManualInputs, ListadoAsistenciasInputs } from "../squemas/asistencias";
import { InfoAlumnoResult } from "../tipados/asistencia.tipado";


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
 * 1. Lee la **foto del horario** (spec 048): nivel, tipo, profesor, día y horas.
 * 2. Inserta la asistencia del alumno para el día actual (CURDATE) junto con esa foto.
 * 3. Calcula la cantidad de clases restantes de la inscripción.
 * 4. Si las clases restantes llegan a 0 o menos, marca la inscripción como "vencidos".
 * 5. Confirma la transacción si todo sale bien, o hace rollback ante cualquier error.
 *
 * Foto del horario (spec 048):
 * - Se guarda en las 9 columnas de snapshot de `asistencias`: `id_nivel`,
 *   `id_tipo_clase`, `dni_profesor`, `dia_semana`, `hora_inicio`, `hora_fin`,
 *   `nombre_profesor`, `nivel` y `tipo_clase`.
 * - Sale de `horarios_clases` (ids, dni del profesor, día y horas normalizadas con
 *   `TIME()`) más los textos de `profesores` (`nombre` + `apellido`), `niveles`
 *   (`nivel`) y `tipo_clase` (`tipo`).
 * - Es **inmutable**: editar o renombrar el horario, el nivel, el tipo o el
 *   profesor después del alta **no** cambia el histórico de la asistencia.
 * - Se lee con la **misma conexión de la transacción** y filtrando por
 *   `id_escuela` (aislamiento multi-tenant: un horario de otra escuela equivale
 *   a inexistente).
 *
 * @throws Lanza si el horario no existe en esa escuela (o no tiene foto que
 *   devolver): `iudEntidadTransaction` hace rollback y se responde
 *   `TRANSACCION_FALLIDA` (los servicios ya manejan ese código).
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
 * - Si el horario desapareciera entre las validaciones y el alta, la foto no se
 *   puede armar: se corta con `TRANSACCION_FALLIDA` en vez de guardar una
 *   asistencia sin foto.
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

    // Foto del horario (spec 048): lo que el horario dice HOY, para congelarlo
    // en la asistencia. Los textos quedan copiados, no referenciados.
    const sqlFotoHorario : string = `SELECT
                                        hc.id_nivel,
                                        hc.id_tipo_clase,
                                        hc.dni_profesor,
                                        hc.dia_semana,
                                        TIME(hc.hora_inicio) AS hora_inicio,
                                        TIME(hc.hora_fin)    AS hora_fin,
                                        NULLIF(TRIM(CONCAT(IFNULL(p.nombre, ''), ' ', IFNULL(p.apellido, ''))), '') AS nombre_profesor,
                                        n.nivel,
                                        tc.tipo              AS tipo_clase
                                    FROM horarios_clases hc
                                    LEFT JOIN profesores p   ON p.dni = hc.dni_profesor
                                    LEFT JOIN niveles n      ON n.id = hc.id_nivel
                                    LEFT JOIN tipo_clase tc  ON tc.id = hc.id_tipo_clase
                                    WHERE hc.id = ?
                                    AND hc.id_escuela = ?
                                    LIMIT 1;`;

    const sqlInsertarAsistencia : string = `INSERT INTO asistencias (
                                                id_escuela,
                                                dni_alumno,
                                                id_inscripcion,
                                                id_horario_clase,
                                                id_nivel,
                                                id_tipo_clase,
                                                dni_profesor,
                                                dia_semana,
                                                hora_inicio,
                                                hora_fin,
                                                nombre_profesor,
                                                nivel,
                                                tipo_clase,
                                                fecha,
                                                estado
                                            )
                                            VALUES (
                                                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'presente'
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

    const valoresFotoHorario : unknown[] = [id_horario_clase, id_escuela];
    const valoresClasesRestantes : unknown[] = [id_inscripcion];
    const valoresActualizarInscripcion : unknown[] = [id_inscripcion];

    const resultado = await iudEntidadTransaction(async(conn)=>{
        // se arma la foto del horario con la misma conexion de la transaccion
        const [resFoto] = await conn.execute(sqlFotoHorario, valoresFotoHorario);
        const foto = (resFoto as any[])[0];
        // sin horario en esta escuela no hay foto: rollback y TRANSACCION_FALLIDA
        if(!foto){
            throw new Error(`No se encontro el horario ${id_horario_clase} en la escuela ${id_escuela} para guardar la foto de la asistencia`);
        };
        // se da la asistencia con la foto incluida
        const valoresInsertarAsistencia : unknown[] = [
            id_escuela,
            dni_alumno,
            id_inscripcion,
            id_horario_clase,
            foto.id_nivel,
            foto.id_tipo_clase,
            foto.dni_profesor,
            foto.dia_semana,
            foto.hora_inicio,
            foto.hora_fin,
            foto.nombre_profesor,
            foto.nivel,
            foto.tipo_clase
        ];
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
                                    -- CASO A: rango normal (ej: 09:00 a 11:00)
                                    (
                                        hc.hora_inicio < hc.hora_fin
                                        AND CAST(NOW() AS TIME)
                                            BETWEEN CAST(hc.hora_inicio AS TIME)
                                            AND CAST(hc.hora_fin AS TIME)
                                    )
                                    OR
                                    -- CASO B: cruza medianoche (ej: 23:00 a 01:00)
                                    (
                                        hc.hora_inicio > hc.hora_fin
                                        AND (
                                            CAST(NOW() AS TIME) >= CAST(hc.hora_inicio AS TIME)
                                            OR CAST(NOW() AS TIME) <= CAST(hc.hora_fin AS TIME)
                                        )
                                    )
                                );
`;
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
    const sql : string = `SELECT 
                            hc.id AS id_horario_prox_clase,
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
                            AND CAST(hc.hora_inicio AS TIME) > CAST(NOW() AS TIME)
                        ORDER BY 
                            CAST(hc.hora_inicio AS TIME) ASC
                        LIMIT 1;`;

    const valores : unknown[] = [id_escuela , estado, dia];
    return await buscarExistenteEntidad<ResultadoClaseProxima>({
        slqEntidad : sql ,
        valores,
        entidad : "proxima_clase"
    });
};




/**
 * Obtiene la información vigente de un alumno para una escuela.
 */
const infoAlumnoData = async ( data : InfoAlumnoInputs )
: Promise<TipadoData<InfoAlumnoResult>> => {
    const { id_escuela , dni_alumno } = data;
    const sql : string = `SELECT
                            i.id_inscripcion,
                            CONCAT(a.nombre, ' ', a.apellido) AS nombre_completo,
                            a.dni_alumno,
                            DATE_FORMAT(i.fecha_fin, '%Y-%m-%d') AS vencimiento,
                            i.estado,
                            COALESCE(pe.nombre_personalizado, p.descripcion_plan) AS plan,
                            ((i.clases_asignadas_inscritas * i.meses_asignados_inscritos) - COUNT(asist.id_asistencia)) AS clases_restantes
                        FROM inscripciones i
                        JOIN alumnos a ON i.dni_alumno = a.dni_alumno
                        JOIN planes_pago p ON i.id_plan = p.id_plan
                        LEFT JOIN planes_en_escuela pe ON (i.id_plan = pe.id_plan AND i.id_escuela = pe.id_escuela)
                        LEFT JOIN asistencias asist ON asist.id_inscripcion = i.id_inscripcion AND asist.estado = 'presente'
                        WHERE i.dni_alumno = ? AND i.id_escuela = ? AND i.estado = 'activos'
                        GROUP BY i.id_inscripcion
                        LIMIT 1;`;
    const valores : unknown[] = [ dni_alumno , id_escuela ];
    return await buscarExistenteEntidad<InfoAlumnoResult>({
        slqEntidad : sql,
        valores,
        entidad : "inscripcion"
    });
};

/**
 * Verifica si un horario de clase es **la clase que está en curso** o
 * **la que viene a continuación** (spec 043 · asistencia manual).
 *
 * A diferencia de `ventanaAsistencia` (que exige estar 15 min antes /
 * 30 min después del inicio), esta regla es la del kiosko en cuanto a
 * *qué clases* se pueden marcar: la de ahora o la próxima.
 *
 * @param data - Datos de la verificación.
 * @param data.id_escuela - Escuela del horario.
 * @param data.estado - Estado del horario ("activos").
 * @param data.dia - Día de la semana en texto.
 * @param data.id_horario_clase - Id del horario a validar.
 *
 * @returns {Promise<TipadoData<number>>} `HORARIO_EXISTE` si es una de las
 *   dos clases permitidas; `HORARIO_NO_EXISTE` si no.
 */
const horarioEnCursoOProxima = async( data : HorarioManualInputs )
: Promise<TipadoData<number>> =>{
    const { id_escuela, estado, dia, id_horario_clase } = data;
    const sql : string = `SELECT hc.id
                            FROM horarios_clases hc
                            WHERE hc.id = ?
                            AND hc.id_escuela = ?
                            AND hc.estado = ?
                            AND hc.vigente = 1
                            AND hc.dia_semana = ?
                            AND (
                                (
                                    hc.hora_inicio < hc.hora_fin
                                    AND CAST(NOW() AS TIME)
                                        BETWEEN CAST(hc.hora_inicio AS TIME)
                                        AND CAST(hc.hora_fin AS TIME)
                                )
                                OR
                                (
                                    hc.hora_inicio > hc.hora_fin
                                    AND (
                                        CAST(NOW() AS TIME) >= CAST(hc.hora_inicio AS TIME)
                                        OR CAST(NOW() AS TIME) <= CAST(hc.hora_fin AS TIME)
                                    )
                                )
                                OR
                                (
                                    CAST(hc.hora_inicio AS TIME) > CAST(NOW() AS TIME)
                                    AND hc.id = (
                                        SELECT h2.id
                                        FROM horarios_clases h2
                                        WHERE h2.id_escuela = ?
                                        AND h2.estado = ?
                                        AND h2.vigente = 1
                                        AND h2.dia_semana = ?
                                        AND CAST(h2.hora_inicio AS TIME) > CAST(NOW() AS TIME)
                                        ORDER BY CAST(h2.hora_inicio AS TIME) ASC
                                        LIMIT 1
                                    )
                                )
                            )
                            LIMIT 1;`;
    const valores : unknown[] = [
        id_horario_clase, id_escuela, estado, dia,
        id_escuela, estado, dia
    ];
    return await buscarExistenteEntidad<number>({
        slqEntidad : sql,
        valores,
        // La entidad define el código de respuesta: con "horario" el hook
        // devuelve HORARIO_EXISTE / HORARIO_NO_EXISTE (igual que
        // `ventanaAsistencia`). Con otro nombre el código no coincidiría y
        // el filtro nunca bloquearía.
        entidad : "horario"
    });
};

/**
 * Busca alumnos por nombre, apellido o DNI para autocompletado.
 * Sólo inscripciones activas de la escuela del token. Máximo 10.
 */
const buscarAlumnoData = async ( data : { id_escuela : number, termino : string } )
: Promise<TipadoData<InfoAlumnoResult[]>> => {
    const { id_escuela, termino } = data;
    const like = `%${termino}%`;
    const sql : string = `SELECT
                            i.id_inscripcion,
                            CONCAT(a.nombre, ' ', a.apellido) AS nombre_completo,
                            a.dni_alumno,
                            DATE_FORMAT(i.fecha_fin, '%Y-%m-%d') AS vencimiento,
                            i.estado,
                            COALESCE(pe.nombre_personalizado, p.descripcion_plan) AS plan,
                            ((i.clases_asignadas_inscritas * i.meses_asignados_inscritos) - COUNT(asist.id_asistencia)) AS clases_restantes
                        FROM inscripciones i
                        JOIN alumnos a ON i.dni_alumno = a.dni_alumno
                        JOIN planes_pago p ON i.id_plan = p.id_plan
                        LEFT JOIN planes_en_escuela pe ON (i.id_plan = pe.id_plan AND i.id_escuela = pe.id_escuela)
                        LEFT JOIN asistencias asist ON asist.id_inscripcion = i.id_inscripcion AND asist.estado = 'presente'
                        WHERE i.id_escuela = ? AND i.estado = 'activos'
                        AND (
                            a.nombre LIKE ? OR a.apellido LIKE ? OR CAST(a.dni_alumno AS CHAR) LIKE ? OR CONCAT(a.nombre, ' ', a.apellido) LIKE ?
                        )
                        GROUP BY i.id_inscripcion
                        ORDER BY a.apellido ASC, a.nombre ASC
                        LIMIT 10;`;
    const valores : unknown[] = [ id_escuela, like, like, like, like ];
    return await listarEntidadSinPaginacion<InfoAlumnoResult>({
        slqListado: sql,
        valores,
        entidad: "inscripcion",
        estado: "activos",
    });
};

/**
 * Fila del listado de asistencias (spec 048).
 *
 * Todos los datos de la clase salen de la **foto** guardada en `asistencias`
 * (no se une `horarios_clases`), salvo el nombre del alumno, que se toma del
 * padrón actual a propósito.
 *
 * Los campos que pueden ser `null` son los de la foto: si una fila vieja no
 * llegó a completarse, se muestra tal cual (`hora_inicio` / `dia_semana`
 * `null`; los textos los resuelve el SQL con `COALESCE`).
 */
export interface ListadoAsistenciaRow {
    id_asistencia: number;
    fecha: string;
    hora_inicio: string | null;
    dia_semana: string | null;
    id_horario_clase: number;
    dni_alumno: number;
    alumno: string;
    dni_profesor: string | null;
    profesor: string;
    id_nivel: number | null;
    nivel: string;
    id_tipo_clase: number | null;
    tipo_clase: string;
    estado: string;
    total_registros: number;
}

/**
 * Lista las asistencias de una escuela en un rango de fechas (spec 048).
 *
 * - El rango `desde` / `hasta` es obligatorio y lo aplica siempre el `WHERE`.
 * - Los filtros opcionales se agregan con **placeholders dinámicos**: el array
 *   `valores` queda alineado 1:1 con `condiciones` y nunca se concatenan
 *   valores en el SQL.
 * - `limit` y `offset` son la única interpolación en el texto de la consulta:
 *   llegan como número ya validado por Zod (`offset` lo calcula el servicio).
 * - Lee la **foto** de la asistencia, así que no depende de `horarios_clases`:
 *   editar o dar de baja un horario no cambia el histórico.
 * - El nombre del alumno **no** es foto: se toma del padrón actual.
 *
 * @param data Filtros ya validados más el `offset` calculado por el servicio.
 * @returns {Promise<TipadoData<ListadoAsistenciaRow[]>>} Listado paginado. Si
 *   no hay filas, `listarEntidad` devuelve `NO_ACTIVE_ASISTENCIAS` sin
 *   `paginacion` (el servicio lo normaliza).
 */
const listadoAsistencias = async( data : ListadoAsistenciasInputs & { offset : number } )
: Promise<TipadoData<ListadoAsistenciaRow[]>> => {
    const { offset } = data;
    const limit = data.limit;

    const condiciones : string[] = [
        "a.id_escuela = ?",
        "a.fecha BETWEEN ? AND ?",
    ];
    const valores : unknown[] = [ data.id_escuela, data.desde, data.hasta ];

    if (data.dia_semana)    { condiciones.push("a.dia_semana = ?");                valores.push(data.dia_semana); }
    // La columna ya es TIME: se castea el PARAMETRO, no la columna, para no
    // esconderla de un indice presente o futuro y para normalizar '17:00'.
    if (data.hora)          { condiciones.push("a.hora_inicio = CAST(? AS TIME)");  valores.push(data.hora); }
    if (data.dni_profesor)  { condiciones.push("a.dni_profesor = ?");              valores.push(data.dni_profesor); }
    if (data.id_nivel)      { condiciones.push("a.id_nivel = ?");                  valores.push(data.id_nivel); }
    if (data.id_tipo_clase) { condiciones.push("a.id_tipo_clase = ?");             valores.push(data.id_tipo_clase); }

    const where : string = `WHERE ${condiciones.join("\n  AND ")}`;

    const slqListado : string = `SELECT
                                    a.id_asistencia,
                                    DATE_FORMAT(a.fecha, '%Y-%m-%d')            AS fecha,
                                    TIME_FORMAT(a.hora_inicio, '%H:%i')         AS hora_inicio,
                                    a.dia_semana,
                                    a.id_horario_clase,
                                    a.dni_alumno,
                                    CONCAT(al.nombre, ' ', al.apellido)         AS alumno,
                                    a.dni_profesor,
                                    COALESCE(a.nombre_profesor, 'Sin profesor') AS profesor,
                                    a.id_nivel,
                                    COALESCE(a.nivel, 'Sin nivel')              AS nivel,
                                    a.id_tipo_clase,
                                    COALESCE(a.tipo_clase, 'Sin tipo')          AS tipo_clase,
                                    a.estado,
                                    COUNT(*) OVER()                             AS total_registros
                                FROM asistencias a
                                INNER JOIN alumnos al ON al.dni_alumno = a.dni_alumno
                                ${where}
                                ORDER BY a.fecha DESC,
                                         a.hora_inicio DESC,
                                         al.apellido ASC,
                                         al.nombre ASC,
                                         a.id_asistencia ASC
                                LIMIT ${limit} OFFSET ${offset};`;

    return await listarEntidad<ListadoAsistenciaRow>({
        slqListado,
        valores,
        entidad : "asistencias",
        estado  : "en el rango pedido",
        limit,
        // El hook recibe `pagina` como string (viene de la query en los otros
        // listados); aca ya es un numero validado por Zod.
        pagina  : String(data.pagina),
    });
};

export const method = {
    infoAlumno : tryCatchDatos( infoAlumnoData ),
    verificarInscripcion : tryCatchDatos( estadoInscripcion ),
    dobleAsitencia  : tryCatchDatos( dobleAsitencia ),
    ventanaAsistencia : tryCatchDatos( ventanaAsistencia ),
    horarioEnCursoOProxima : tryCatchDatos( horarioEnCursoOProxima ),
    asistencia : tryCatchDatos( asistenciaAlta ),
    vencerInscripciones : tryCatchDatos( vencerInscripciones),
    claseEnCurso : tryCatchDatos( clase_en_curso ),
    proximaClase : tryCatchDatos( clase_proxima_clase ),
    buscarAlumno : tryCatchDatos( buscarAlumnoData ),
    listadoAsistencias : tryCatchDatos( listadoAsistencias ),
    
};