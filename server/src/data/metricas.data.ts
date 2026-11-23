import { tryCatchDatos } from "../utils/tryCatchBD";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";



export  interface ReultTarjetasInscripcion{
    total_activos: number,
    nuevos_este_mes:  number,
    porcentaje_nuevos:  number,
}

export  interface ReultTarjetasInscripcionMesAnterior{
    total_activos: number,
    nuevos_este_mes:  number,
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
const metricasInscMesAnterior = async ( id_escuela : number)
:Promise<TipadoData<ReultTarjetasInscripcionMesAnterior>> => {

    // Contamos los alumnos que estaban activos al inicio de este mes:
    // aquellos con estado 'activos' cuya fecha_fin es >= el primer día del mes actual
    // (es decir, aún no habían vencido cuando empezó el mes).
    // Para "nuevos", contamos los que se inscribieron el mes anterior.
    const now = new Date();
    const primerDiaMesActual = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

    const sql = `SELECT 
                        COUNT(*) AS total_activos,
                        SUM(CASE 
                            WHEN MONTH(fecha_inicio) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
                            AND YEAR(fecha_inicio) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
                            THEN 1 ELSE 0 
                        END) AS nuevos_este_mes
                    FROM inscripciones
                    WHERE estado = 'activos' 
                    AND id_escuela = ?
                    AND fecha_fin >= ? ;`;

    const valor : unknown[] = [ id_escuela, primerDiaMesActual];

    return buscarExistenteEntidad({
         entidad : "Metricas_inscripciones_mes_anterior",
         valores : valor,
         slqEntidad : sql
    });

};

const metricasVencimientos = async ( id_escuela : number)
:Promise<TipadoData<ReultTarjetasVencimientos>> =>{

    const sql = `SELECT 
                    -- Los que vencen en los próximos 7 días (estos sí suelen ser 'activos')
                    SUM(CASE 
                        WHEN estado = 'activos' 
                            AND fecha_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
                        THEN 1 ELSE 0 
                    END) AS vencen_proximos,

                    -- Los que vencieron este mes (pueden estar inactivos o haber vencido recién)
                    SUM(CASE 
                        WHEN fecha_fin < CURDATE() 
                            AND MONTH(fecha_fin) = MONTH(CURDATE()) 
                            AND YEAR(fecha_fin) = YEAR(CURDATE()) 
                        THEN 1 ELSE 0 
                    END) AS vencidos_este_mes
                FROM inscripciones
                WHERE (estado = 'activos' OR (fecha_fin < CURDATE() AND MONTH(fecha_fin) = MONTH(CURDATE()) AND YEAR(fecha_fin) = YEAR(CURDATE())))
                AND id_escuela = ?;`;

    const valor : unknown[] = [ id_escuela];

    return buscarExistenteEntidad({
         entidad : "Metricas_vencimientos",
         valores : valor,
         slqEntidad : sql
    });
};

const metricasVencimientosMesAnterior = async ( id_escuela : number)
:Promise<TipadoData<ReultTarjetasVencimientos>> =>{

    const sql = `SELECT 
                    SUM(CASE 
                        WHEN estado = 'activos' 
                            AND fecha_fin BETWEEN (CURDATE() - INTERVAL 1 MONTH) AND DATE_ADD((CURDATE() - INTERVAL 1 MONTH), INTERVAL 7 DAY) 
                        THEN 1 ELSE 0 
                    END) AS vencen_proximos,

                    SUM(CASE 
                        WHEN fecha_fin < (CURDATE() - INTERVAL 1 MONTH) 
                            AND MONTH(fecha_fin) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
                            AND YEAR(fecha_fin) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
                        THEN 1 ELSE 0 
                    END) AS vencidos_este_mes
                FROM inscripciones
                WHERE (estado = 'activos' OR (fecha_fin < (CURDATE() - INTERVAL 1 MONTH) AND MONTH(fecha_fin) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(fecha_fin) = YEAR(CURDATE() - INTERVAL 1 MONTH)))
                AND id_escuela = ?;`;

    const valor : unknown[] = [ id_escuela];

    return buscarExistenteEntidad({
         entidad : "Metricas_vencimientos_mes_anterior",
         valores : valor,
         slqEntidad : sql
    });
};

export interface ResultClase {
    nombre_clase: string,
    horario: string,
    nombre_profesor: string,
    id_clase : number,
    sala: string
};
/**
 * Obtiene TODAS las clases que se están dictando en el momento actual
 * para una escuela específica, incluyendo las de diferentes salas.
 * * La función filtra por el día de la semana actual, el estado 'activos',
 * la vigencia (vigente = 1) y verifica si la hora actual se encuentra dentro
 * del rango de inicio y fin de la clase, contemplando incluso clases que
 * cruzan la medianoche.
 * * @param {number} id_escuela - El identificador único de la escuela a consultar.
 * * @returns {Promise<TipadoData<ResultClase[]>>} 
 * Una promesa que resuelve con un array de clases encontradas,
 * incluyendo nombre de clase, rango horario, profesor, sala y el ID de cada clase.
 * * @throws {Error} Si la consulta a la base de datos falla a través de `listarEntidadSinPaginacion`.
 */
const encabezadoClases = ( id_escuela : number)
:Promise<TipadoData<ResultClase[]>> =>{

    const sql = `SELECT 
                    hc.id AS id_clase,
                    tc.tipo AS nombre_clase,
                    CONCAT(hc.hora_inicio, ' - ', hc.hora_fin) AS horario,
                    CONCAT_WS(' ', p.nombre, p.apellido) AS nombre_profesor,
                    COALESCE(s.nombre, 'Sin sala') AS sala
                FROM horarios_clases hc
                INNER JOIN tipo_clase tc ON hc.id_tipo_clase = tc.id
                INNER JOIN profesores p ON hc.dni_profesor = p.dni
                LEFT JOIN salas s ON s.id = hc.id_sala
                WHERE hc.id_escuela = ?
                AND hc.estado = 'activos'
                AND hc.vigente = 1
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
                    (CAST(hc.hora_inicio AS TIME) < CAST(hc.hora_fin AS TIME) AND CAST(NOW() AS TIME) BETWEEN CAST(hc.hora_inicio AS TIME) AND CAST(hc.hora_fin AS TIME))
                    OR
                    -- Caso medianoche: la clase termina al día siguiente (ej. 23:00 - 00:00)
                    (CAST(hc.hora_inicio AS TIME) > CAST(hc.hora_fin AS TIME) AND (CAST(NOW() AS TIME) >= CAST(hc.hora_inicio AS TIME) OR CAST(NOW() AS TIME) < CAST(hc.hora_fin AS TIME)))
                )
                ORDER BY hc.hora_inicio ASC;`;

    const valor : unknown[] = [ id_escuela];

    return listarEntidadSinPaginacion({
         entidad : "encabezado_clases",
         valores : valor,
         slqListado : sql,
         estado : "en curso"
    });  

};


export interface ResultAsistencia {
   nombre : string , apellido : string , estado : string , id_horario_clase : number
};

/** Clase con sus alumnos agrupados — respuesta del servicio de asistencia */
export interface ResultClaseConAsistencia {
   id_clase: number,
   nombre_clase: string,
   horario: string,
   nombre_profesor: string,
   sala: string,
   alumnos: ResultAsistencia[]
};

/**
 * Obtiene el listado completo de alumnos que han registrado asistencia para uno o más
 * horarios de clase. Incluye el `id_horario_clase` en cada registro para que el servicio
 * pueda agrupar los alumnos por su clase correspondiente.
 * * @param {number[]} id_horarios - Array de identificadores de horarios de clase a consultar.
 * * @returns {Promise<TipadoData<ResultAsistencia[]>>} 
 * Una promesa que resuelve con un arreglo de objetos, donde cada objeto contiene la información 
 * básica del alumno, su estado de asistencia y el id_horario_clase que lo vincula a su clase.
 * * @throws {Error} Si la consulta a la base de datos falla a través de `listarEntidadSinPaginacion`.
 */
const asistenciaClases = ( id_horarios : number[] )
:Promise<TipadoData<ResultAsistencia[]>> =>{

    const placeholders = id_horarios.map(() => '?').join(', ');
    const sql = `SELECT 
                    a.nombre, 
                    a.apellido, 
                    ast.estado,
                    ast.id_horario_clase
                FROM asistencias ast
                INNER JOIN alumnos a ON ast.dni_alumno = a.dni_alumno
                WHERE ast.id_horario_clase IN (${placeholders})
                AND ast.fecha = CURDATE();`;

    const valor : unknown[] = id_horarios;

    return listarEntidadSinPaginacion({
        entidad : "asistencias",
        estado  : "de alumnos presentes",
        slqListado : sql,
        valores : valor
    });

};


export interface VencimientoEscuela {
  id_escuela: number;
  razon_social: string;
  fecha_vencimiento: string; 
}

const fechaVencimiento = async ( id_escuela : number )
:Promise<TipadoData<VencimientoEscuela>> =>{

      const sql : string = `SELECT 
                                e.id_escuela,
                                e.razon_social,
                               s.fecha_vencimiento
                            FROM escuelas e
                            INNER JOIN suscripciones_escuelas s ON e.id_escuela = s.id_escuela
                            WHERE e.id_escuela = ?
                                AND s.estado = 'activo';`;

    const valor : unknown[] = [ id_escuela  ]; 
    
    return await buscarExistenteEntidad({
        slqEntidad : sql,
        valores : valor,
        entidad : "FECHA_VENCIMIENTO"
    });  
};

export const  method = {
    metricasInsc : tryCatchDatos( metricasInsc ),
    metricasInscMesAnterior : tryCatchDatos( metricasInscMesAnterior ),
    metricasVencimientos : tryCatchDatos( metricasVencimientos ),
    metricasVencimientosMesAnterior : tryCatchDatos( metricasVencimientosMesAnterior ),
    encabezadoClases   : tryCatchDatos( encabezadoClases ),
    asistenciaClases : tryCatchDatos( asistenciaClases ),
    fechaVencimiento : tryCatchDatos( fechaVencimiento ),
};