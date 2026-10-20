import { tryCatchDatos } from "../utils/tryCatchBD";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";

import { TipadoData } from "../tipados/tipado.data";


export interface EscuelaAlumnoRow {
  id_escuela: number;
  razon_social: string;
  direccion: string;
  celular: string; 
  dni_propietario: number;
  nombre_propietario: string;
  apellido_propietario: string;
  fecha_alta_escuela: string; 
  estado_en_escuela: string;
  /** Logo de la escuela (R2). `null` si la escuela nunca lo cargó o lo tiene vacío. */
  url_imagen: string | null;
  /** Inscripción ACTIVA del alumno en esa escuela. `null` si no tiene ninguna. */
  id_inscripcion: number | null;
  /** Estado de la inscripción activa. `null` si el alumno no tiene inscripción activa. */
  estado_inscripcion: "activos" | "suspendido" | "vencidos" | null;
  /** Nombre del plan contratado (personalizado por la escuela o el maestro). */
  descripcion_plan: string | null;
  /** Inicio de la inscripción activa ("YYYY-MM-DD"). */
  fecha_inicio_plan: string | null;
  /** Vencimiento de la inscripción activa ("YYYY-MM-DD"). */
  fecha_vencimiento_plan: string | null;
  /** Días que faltan para el vencimiento. Negativo si ya venció. */
  dias_restantes: number | null;
  /** Total de clases del plan: `clases_asignadas_inscritas * meses_asignados_inscritos`. */
  clases_plan: number | null;
  /** Clases a las que asistió (asistencias con `estado = 'presente'`). */
  clases_asistidas: number | null;
  /** Porcentaje de clases del plan que ya consumió. */
  porcentaje_clases_asistidas: number | null;
}


const obtenerDniAlumno = async ( correo : string)
:Promise<TipadoData<{dni_alumno : number}>> =>{
    const sql : string = `SELECT a.dni_alumno 
                            FROM alumnos a 
                            JOIN usuarios u ON u.correo = a.email 
                            WHERE u.correo = ?;`;

    const valor : unknown[] = [correo]; 
    
    return await buscarExistenteEntidad({
        slqEntidad : sql,
        valores : valor,
        entidad : "DNI_ALUMNO"
    }); 
};

/**
 * Devuelve las escuelas en las que el alumno está anotado, con los datos de
 * su inscripción ACTIVA (`estado = 'activos'`): plan, vencimiento, días que
 * faltan y porcentaje de clases consumidas, más el logo de la escuela.
 *
 * - La inscripción activa se resuelve con `ROW_NUMBER() OVER (PARTITION BY
 *   id_escuela ORDER BY fecha_inicio DESC)`: si el alumno tuviera más de una
 *   inscripción activa en la misma escuela, solo se trae la más reciente y la
 *   fila NO se duplica.
 * - El `LEFT JOIN` hace que las escuelas donde el alumno está anotado pero
 *   **no tiene inscripción activa** SEGUIDAN apareciendo, con los datos del
 *   plan en `null`.
 * - Las clases se cuentan con `estado = 'presente'`, que es el único estado
 *   que consume clase de la inscripción (ver `consultas.data/asistencias.sql`).
 * - `NULLIF(e.urlImagen, '')` deja el logo en `null` cuando la escuela no lo
 *   tiene cargado (columna vacía o `NULL`).
 *
 * @param {number} dni_alumno - DNI del alumno.
 * @returns {Promise<TipadoData<EscuelaAlumnoRow[]>>} schools con los datos del
 * plan de la inscripción activa.
 */
const obtenerEscuelasPorAlumno = async ( dni_alumno : number)
:Promise<TipadoData<EscuelaAlumnoRow[]>> =>{

    const sql : string = `SELECT 
                                e.id_escuela,
                                e.razon_social,
                                e.direccion,
                                e.celular,
                                e.dni_propietario,
                                e.nombre_propietario,
                                e.apellido_propietario,
                                NULLIF(e.urlImagen, '') AS url_imagen,
                                ae.fecha_alta_escuela,
                                ae.estado AS estado_en_escuela,
                                i.id_inscripcion,
                                i.estado AS estado_inscripcion,
                                COALESCE(pe.nombre_personalizado, pp.descripcion_plan) AS descripcion_plan,
                                DATE_FORMAT(i.fecha_inicio, '%Y-%m-%d') AS fecha_inicio_plan,
                                DATE_FORMAT(i.fecha_fin, '%Y-%m-%d') AS fecha_vencimiento_plan,
                                DATEDIFF(i.fecha_fin, CURDATE()) AS dias_restantes,
                                (i.clases_asignadas_inscritas * i.meses_asignados_inscritos) AS clases_plan,
                                CASE 
                                    WHEN i.id_inscripcion IS NULL THEN NULL
                                    ELSE (
                                        SELECT COUNT(*) 
                                        FROM asistencias ast 
                                        WHERE ast.id_inscripcion = i.id_inscripcion 
                                        AND ast.estado = 'presente'
                                    )
                                END AS clases_asistidas,
                                CASE 
                                    WHEN (i.clases_asignadas_inscritas * i.meses_asignados_inscritos) > 0
                                    THEN ROUND(
                                            (
                                                SELECT COUNT(*) 
                                                FROM asistencias ast 
                                                WHERE ast.id_inscripcion = i.id_inscripcion 
                                                AND ast.estado = 'presente'
                                            ) * 100.0 
                                            / (i.clases_asignadas_inscritas * i.meses_asignados_inscritos)
                                        , 2 ) + 0e0
                                    ELSE NULL
                                END AS porcentaje_clases_asistidas
                            FROM alumnos a
                            INNER JOIN alumnos_en_escuela ae ON a.dni_alumno = ae.dni_alumno
                            INNER JOIN escuelas e ON ae.id_escuela = e.id_escuela
                            LEFT JOIN (
                                SELECT ins.*, 
                                        ROW_NUMBER() OVER (
                                            PARTITION BY ins.id_escuela 
                                            ORDER BY ins.fecha_inicio DESC, ins.id_inscripcion DESC
                                        ) AS rn
                                FROM inscripciones ins
                                WHERE ins.dni_alumno = ? 
                                AND ins.estado = 'activos'
                            ) i ON i.id_escuela = e.id_escuela 
                                AND i.rn = 1
                            LEFT JOIN planes_en_escuela pe 
                                ON pe.id_escuela = i.id_escuela 
                                AND pe.id_plan = i.id_plan
                            LEFT JOIN planes_pago pp 
                                ON pp.id_plan = i.id_plan
                            WHERE a.dni_alumno = ?`;

    const valor : unknown[] = [ dni_alumno, dni_alumno ];
    
    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores    : valor,
        entidad    : "METRICAS_ESCEULAS_ALUMNOS",
        estado : ""
    });

};


export interface ClaseHoyRow {
  id_escuela: number;
  hora: string;
  academia: string;
  tipoBaile: string;
  nivel: string;
  profesor: string;
}

const obtenerClasesEscuelasHoy =  async ( dni_alumno : number )
:Promise<TipadoData<ClaseHoyRow[]>> => {

    const diasMapeo = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const hoy = new Date();
    const diaActual = diasMapeo[hoy.getDay()];

    const sql : string = `SELECT 
                                e.id_escuela,
                                CONCAT(hc.hora_inicio, ' - ', hc.hora_fin) AS hora,
                                e.razon_social AS academia,
                                tc.tipo AS tipoBaile,
                                n.nivel AS nivel,
                                CONCAT(p.nombre, ' ', p.apellido) AS profesor
                            FROM alumnos_en_escuela ae
                            INNER JOIN escuelas e ON ae.id_escuela = e.id_escuela
                            INNER JOIN horarios_clases hc ON e.id_escuela = hc.id_escuela
                            INNER JOIN tipo_clase tc ON hc.id_tipo_clase = tc.id
                            INNER JOIN niveles n ON hc.id_nivel = n.id
                            INNER JOIN profesores p ON hc.dni_profesor = p.dni
                            WHERE ae.dni_alumno = ? 
                            AND hc.dia_semana =  ?
                            AND ae.estado = 'activos' 
                            AND hc.estado = 'activos' 
                            AND hc.vigente = TRUE
                            ORDER BY hc.hora_inicio ASC;`;

    const valor : unknown[] = [ dni_alumno, diaActual];
    
    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores    : valor,
        entidad    : "METRICAS_CLASES_HOY",
        estado : ""
    });

};

export interface EscuelaData {
  dni_propietario: number;
  nombre_propietario: string;
  apellido_propietario: string;
  razon_social: string;
  direccion: string;
  celular: string;
  /** Logo de la escuela (URL pública de R2). `null` si no tiene logo cargado. */
  urlImagen: string | null;
};




/**
 * Datos de la cabecera (hero) de una escuela: propietario, razón social,
 * dirección, celular y el logo.
 *
 * El logo sale de `escuelas.urlImagen` con `NULLIF(..., '')`: si la escuela
 * no lo tiene cargado, el frontend recibe `null` (tanto si la columna está
 * vacía como si está en `NULL`).
 *
 * @param {number} id_escuela - Id de la escuela.
 * @returns {Promise<TipadoData<EscuelaData>>} Datos de la escuela, o el
 * código `DATA_ESCUELA_NO_EXISTE` si no hay escuela con ese id.
 */
export const dataEscuela = async ( id_escuela : number)
:Promise<TipadoData<EscuelaData>> =>{
    const sql : string = `SELECT 
                            dni_propietario,
                            nombre_propietario,
                            apellido_propietario,
                            razon_social,
                            direccion,
                            celular,
                            NULLIF(urlImagen, '') AS urlImagen
                        FROM escuelas
                        WHERE id_escuela = ?;`;

    const valor : unknown[] = [ id_escuela ]; 
    
    return await buscarExistenteEntidad({
        slqEntidad : sql,
        valores : valor,
        entidad : "DATA_ESCUELA"
    });

};


export interface InscripcionActualData {
  id_inscripcion: number;
  id_plan: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  clases_asignadas_inscritas: number;
  meses_asignados_inscritos: number;
  monto: number;
  estado: "activos" | "suspendido" | "vencidos";
  descripcion_plan: string;
  clases_utilizadas: number;
}

interface PropInscirpcion {
    dni_alumno : number,
    id_escuela : number,
};

export const inscripcionActual = async ( data :  PropInscirpcion)
:Promise<TipadoData<InscripcionActualData>> =>{

    const {dni_alumno , id_escuela } = data;

    const sql : string = `SELECT 
                            i.id_inscripcion,
                            i.id_plan,
                            DATE_FORMAT(i.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
                            DATE_FORMAT(i.fecha_fin, '%Y-%m-%d') AS fecha_fin,
                            i.clases_asignadas_inscritas,
                            i.meses_asignados_inscritos,
                            i.monto,
                            i.estado,
                            COALESCE(pe.nombre_personalizado, 'Plan general') AS descripcion_plan,
                            (
                                SELECT COUNT(*) 
                                FROM asistencias a 
                                WHERE a.id_inscripcion = i.id_inscripcion 
                                AND a.estado = 'presente'
                            ) AS clases_utilizadas
                        FROM inscripciones i
                        LEFT JOIN planes_en_escuela pe 
                            ON i.id_escuela = pe.id_escuela 
                            AND i.id_plan = pe.id_plan
                        WHERE i.dni_alumno = ?  
                        AND i.id_escuela = ?
                        AND i.estado = 'activos'
                        ORDER BY i.fecha_inicio DESC
                        LIMIT 1`;

    const valor : unknown[] = [dni_alumno, id_escuela  ]; 
    
    return await buscarExistenteEntidad({
        slqEntidad : sql,
        valores : valor,
        entidad : "INSCRIPCION_ACTUAL"
    });
};


export interface PlanEscuelaData {
  id_plan: number;
  descripcion_plan: string;
  cantidad_clases: number;
  cantidad_meses: number;
  monto: number;
  estado: string;
};

export const planesActivos = async ( id_escuela : number)
:Promise<TipadoData<PlanEscuelaData[]>> =>{

    const sql : string = `SELECT 
                                pp.id_plan,
                                COALESCE(pe.nombre_personalizado, pp.descripcion_plan) AS descripcion_plan,
                                pe.clases_asignadas AS cantidad_clases,
                                pe.meses_asignados AS cantidad_meses,
                                pe.monto_asignado AS monto,
                                pe.estado
                            FROM planes_en_escuela pe
                            INNER JOIN planes_pago pp 
                                ON pe.id_plan = pp.id_plan
                            WHERE pe.id_escuela = ?
                            AND pe.estado = 'activos';`;

    const valor : unknown[] = [ id_escuela ];
    
    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores    : valor,
        entidad    : "PLANES_ACTIVOS",
        estado : ""
    });

};

export interface HorarioClaseData {
  id: number;
  dia_semana:
    | "lunes"
    | "martes"
    | "miercoles"
    | "jueves"
    | "viernes"
    | "sabado"
    | "domingo";
  hora_inicio: string;
  hora_fin: string;
  tipo_clase: string; // Viene de tipo_clase.tipo (Ej: Bachata, Salsa)
  nivel: string; // Viene de niveles.nivel (Ej: Principiante, Intermedio)
  nombre_profesor: string; // Nombre y apellido concatenados de la tabla profesores
  estado: string;
}

const horarioEscuela =async ( id_escuela : number )
:Promise<TipadoData<HorarioClaseData[]>> =>{
      const sql : string = `SELECT 
                                h.id,
                                h.dia_semana,
                                h.hora_inicio,
                                h.hora_fin,
                                tc.tipo AS tipo_clase,
                                n.nivel AS nivel,
                                CONCAT(p.nombre, ' ', p.apellido) AS nombre_profesor,
                                h.estado
                            FROM horarios_clases h
                            LEFT JOIN tipo_clase tc 
                                ON h.id_tipo_clase = tc.id
                            LEFT JOIN niveles n 
                                ON h.id_nivel = n.id
                            LEFT JOIN profesores_en_escuela pe 
                                ON h.dni_profesor = pe.dni_profesor AND h.id_escuela = pe.id_escuela
                            LEFT JOIN profesores p 
                                ON pe.dni_profesor = p.dni -- (Ajusta 'p.dni' si tu tabla de profesores usa otra columna para el documento)
                            WHERE h.id_escuela = ?
                            AND h.estado = 'activos'
                            ORDER BY 
                                FIELD(h.dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
                                h.hora_inicio ASC;`;

    const valor : unknown[] = [ id_escuela ];
    
    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores    : valor,
        entidad    : "HORARIO_ESCUELA",
        estado : ""
    });  
};


export interface AsistenciaInscripcionRow {
  fecha: string;              // "YYYY-MM-DD" (fecha real de la asistencia)
  id_horario_clase: number;
  dia_semana: string;         // lunes..domingo
  hora: string;               // "16:00 - 17:00" (CONCAT de hora_inicio y hora_fin)
  tipo_clase: string;         // tipo_clase.tipo (Ej: Bachata)
  nivel: string;              // niveles.nivel (Ej: Principiante)
  profesor: string;           // nombre y apellido concatenados
}

/**
 * Historial de asistencias PERSISTIDAS de una inscripción, con los datos
 * del horario al que el alumno asistió (clase, nivel, día, hora y profesor).
 *
 * Se filtra por `estado = 'presente'` porque es la única que consume clase
 * de la inscripción. NO se filtra `estado` ni `vigente` de `horarios_clases`:
 * es un historial, la clase pudo desactivarse después de que asistió.
 *
 * @param {number} id_inscripcion - Inscripción a consultar.
 * @returns {Promise<TipadoData<AsistenciaInscripcionRow[]>>}
 * Retorna un objeto tipado con el resultado de la consulta.
 *
 * @returns.code ASISTENCIAS_INSCRIPCION_LISTED - Hay asistencias registradas.
 * @returns.code NO_ACTIVE_ASISTENCIAS_INSCRIPCION - La inscripción no tiene asistencias.
 */
const asistenciasPorInscripcion = async ( id_inscripcion : number )
:Promise<TipadoData<AsistenciaInscripcionRow[]>> => {

    const sql : string = `SELECT 
                                DATE_FORMAT(a.fecha, '%Y-%m-%d') AS fecha,
                                hc.id AS id_horario_clase,
                                hc.dia_semana,
                                CONCAT(hc.hora_inicio, ' - ', hc.hora_fin) AS hora,
                                tc.tipo AS tipo_clase,
                                n.nivel AS nivel,
                                CONCAT(p.nombre, ' ', p.apellido) AS profesor
                            FROM asistencias a
                            INNER JOIN horarios_clases hc ON a.id_horario_clase = hc.id
                            INNER JOIN tipo_clase tc ON hc.id_tipo_clase = tc.id
                            INNER JOIN niveles n ON hc.id_nivel = n.id
                            INNER JOIN profesores p ON hc.dni_profesor = p.dni
                            WHERE a.id_inscripcion = ?
                            AND a.estado = 'presente'
                            ORDER BY a.fecha DESC, hc.hora_inicio ASC;`;

    const valor : unknown[] = [ id_inscripcion ];

    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores    : valor,
        entidad    : "ASISTENCIAS_INSCRIPCION",
        estado : ""
    });
};


export const method = {

    obtenerEscuelasPorAlumno : tryCatchDatos( obtenerEscuelasPorAlumno ),
    obtenerClasesEscuelasHoy : tryCatchDatos( obtenerClasesEscuelasHoy),
    obtenerDniAlumno : tryCatchDatos( obtenerDniAlumno),
    dataEscuela    : tryCatchDatos( dataEscuela ),
    inscripcionActual : tryCatchDatos( inscripcionActual),
    planesActivos : tryCatchDatos( planesActivos),
    horarioEscuela : tryCatchDatos( horarioEscuela),
    asistenciasPorInscripcion : tryCatchDatos( asistenciasPorInscripcion ),

};