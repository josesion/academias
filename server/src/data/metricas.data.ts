import { tryCatchDatos } from "../utils/tryCatchBD";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";



export  interface ReultTarjetasInscripcion{
    total_activos: number,
    nuevos_este_mes:  number,
    porcentaje_nuevos:  number,
};
/**
 * Obtiene métricas estadísticas de las inscripciones de una escuela específica.
 * * Calcula el total de alumnos activos, cuántos de ellos se inscribieron 
 * en el mes en curso y el porcentaje que representan sobre el total.
 *
 * @async
 * @function metricasInsc
 * @param {number} id_escuela - El identificador único de la escuela a consultar.
 * @returns {Promise<TipadoData<{ total_activos: number, nuevos_este_mes: number, porcentaje_nuevos: number }>>} 
 * Una promesa que resuelve a un objeto con la estructura de datos de las métricas.
 * * @example
 * const metricas = await metricasInsc(107);
 * if (!metricas.error) {
 * console.log(metricas.data.total_activos);
 * }
 */
const metricasInsc = async ( id_escuela : number)
:Promise<TipadoData<ReultTarjetasInscripcion>> => {

    const sql = `SELECT 
                        COUNT(*) AS total_activos,
                        SUM(CASE 
                            WHEN MONTH(fecha_inicio) = MONTH(CURDATE()) 
                            AND YEAR(fecha_inicio) = YEAR(CURDATE()) 
                            THEN 1 ELSE 0 
                        END) AS nuevos_este_mes,
                        ROUND(
                            (SUM(CASE 
                                WHEN MONTH(fecha_inicio) = MONTH(CURDATE()) 
                                AND YEAR(fecha_inicio) = YEAR(CURDATE()) 
                                THEN 1 ELSE 0 
                            END) * 100.0 / NULLIF(COUNT(*), 0)), 
                        2) AS porcentaje_nuevos
                    FROM inscripciones
                    WHERE estado = 'activos' 
                    AND id_escuela =  ? ;`;

    const valor : unknown[] = [ id_escuela];

    return buscarExistenteEntidad({
         entidad : "Metricas_inscripciones",
         valores : valor,
         slqEntidad : sql
    });

};

export  interface ReultTarjetasVencimientos{
    vencen_proximos:  number,
    vencidos_este_mes:  number,
};

/**
 * Obtiene métricas de vencimientos para las inscripciones de una escuela específica.
 * * Calcula cuántas inscripciones vencen en los próximos 7 días y cuántas 
 * han vencido durante el mes actual.
 *
 * @async
 * @function metricasVencimientos
 * @param {number} id_escuela - El identificador único de la escuela a consultar.
 * @returns {Promise<TipadoData<{ vencen_proximos: number, vencidos_este_mes: number }>>} 
 * Una promesa que resuelve a un objeto con la estructura de datos de los vencimientos.
 * * @example
 * const vencimientos = await metricasVencimientos(107);
 * if (!vencimientos.error) {
 * console.log(`Próximos a vencer: ${vencimientos.data.vencen_proximos}`);
 * }
 */
const metricasVencimientos = async ( id_escuela : number)
:Promise<TipadoData<ReultTarjetasVencimientos>> =>{

    const sql = `SELECT 
                    -- Inscripciones que vencen en los próximos 7 días (a partir de hoy)
                    SUM(CASE 
                        WHEN fecha_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
                        THEN 1 ELSE 0 
                    END) AS vencen_proximos,

                    -- Inscripciones que vencieron dentro del mes actual
                    SUM(CASE 
                        WHEN fecha_fin < CURDATE() 
                        AND MONTH(fecha_fin) = MONTH(CURDATE()) 
                        AND YEAR(fecha_fin) = YEAR(CURDATE()) 
                        THEN 1 ELSE 0 
                    END) AS vencidos_este_mes
                FROM inscripciones
                WHERE estado = 'activos' 
                AND id_escuela = ? ;`;

    const valor : unknown[] = [ id_escuela];

    return buscarExistenteEntidad({
         entidad : "Metricas_vencimientos",
         valores : valor,
         slqEntidad : sql
    });
};

export interface ResultClase {
    nombre_clase: string,
    horario: string,
    nombre_profesor: string,
    id_clase : number
};
/**
 * Obtiene la información del encabezado de la clase que se está dictando en el momento actual
 * para una escuela específica.
 * * La función filtra por el día de la semana actual, el estado 'activo' y verifica
 * si la hora actual se encuentra dentro del rango de inicio y fin de la clase, 
 * contemplando incluso clases que cruzan la medianoche.
 * * @param {number} id_escuela - El identificador único de la escuela a consultar.
 * * @returns {Promise<TipadoData<{nombre_clase: string, horario: string, nombre_profesor: string, id_clase: number}>>} 
 * Una promesa que resuelve con la estructura de datos de la clase encontrada, 
 * incluyendo nombre de clase, rango horario, profesor y el ID de la clase.
 * * @throws {Error} Si la consulta a la base de datos falla a través de `buscarExistenteEntidad`.
 */
const encabezadoClases = ( id_escuela : number)
:Promise<TipadoData<ResultClase>> =>{

    const sql = `SELECT 
                    hc.id AS id_clase,
                    tc.tipo AS nombre_clase,
                    CONCAT(hc.hora_inicio, ' - ', hc.hora_fin) AS horario,
                    CONCAT_WS(' ', p.nombre, p.apellido) AS nombre_profesor
                FROM horarios_clases hc
                INNER JOIN tipo_clase tc ON hc.id_tipo_clase = tc.id
                INNER JOIN profesores p ON hc.dni_profesor = p.dni
                WHERE hc.id_escuela = ?
                AND hc.estado = 'activos'
                AND hc.dia_semana = CASE LOWER(DAYNAME(CURDATE()))
                    WHEN 'monday' THEN 'lunes'
                    WHEN 'tuesday' THEN 'martes'
                    WHEN 'wednesday' THEN 'miercoles'
                    WHEN 'thursday' THEN 'jueves'
                    WHEN 'friday' THEN 'viernes'
                    WHEN 'saturday' THEN 'sabado'
                    WHEN 'sunday' THEN 'domingo'
                END
                AND (
                    -- Caso normal: la clase termina el mismo día (ej. 14:00 - 15:00)
                    (hc.hora_inicio < hc.hora_fin AND DATE_FORMAT(CURTIME(), '%H:%i') BETWEEN hc.hora_inicio AND hc.hora_fin)
                    OR
                    -- Caso medianoche: la clase termina al día siguiente (ej. 23:00 - 00:00)
                    (hc.hora_inicio > hc.hora_fin AND (DATE_FORMAT(CURTIME(), '%H:%i') >= hc.hora_inicio OR DATE_FORMAT(CURTIME(), '%H:%i') < hc.hora_fin))
                )
                LIMIT 1;`;

    const valor : unknown[] = [ id_escuela];

    return buscarExistenteEntidad({
         entidad : "Metricas_encabezado_clases",
         valores : valor,
         slqEntidad : sql
    });  

};


export interface ResultAsistencia {
   nombre : string , apellido : string , estado : string 
};

/**
 * Obtiene el listado completo de alumnos que han registrado asistencia para un horario de clase específico.
 * * Realiza un `INNER JOIN` entre la tabla de asistencias y la de alumnos para recuperar 
 * los nombres, apellidos y el estado de asistencia de cada registro.
 * * @param {number} id_horario - El identificador único del horario de clase (`id_horario_clase`) a consultar.
 * * @returns {Promise<TipadoData<{nombre: string, apellido: string, estado: string}[]>>} 
 * Una promesa que resuelve con un arreglo de objetos, donde cada objeto contiene la información 
 * básica del alumno y su estado de asistencia.
 * * @throws {Error} Si la consulta a la base de datos falla a través de `listarEntidadSinPaginacion`.
 */
const asistenciaClases = ( id_horario : number)
:Promise<TipadoData<ResultAsistencia[]>> =>{

    const sql = `SELECT 
                    a.nombre, 
                    a.apellido, 
                    ast.estado
                FROM asistencias ast
                INNER JOIN alumnos a ON ast.dni_alumno = a.dni_alumno
                WHERE ast.id_horario_clase = ?;`;

    const valor : unknown[] = [ id_horario];

    return listarEntidadSinPaginacion({
        entidad : "asistencias",
        estado  : "de alumnos presentes",
        slqListado : sql,
        valores : valor
    });

};

export const  method = {
    metricasInsc : tryCatchDatos( metricasInsc ),
    metricasVencimientos : tryCatchDatos( metricasVencimientos ),
    encabezadoClases   : tryCatchDatos( encabezadoClases ),
    asistenciaClases : tryCatchDatos( asistenciaClases ),
};