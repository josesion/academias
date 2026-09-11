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
                                ae.fecha_alta_escuela,
                                ae.estado AS estado_en_escuela
                            FROM alumnos a
                            INNER JOIN alumnos_en_escuela ae ON a.dni_alumno = ae.dni_alumno
                            INNER JOIN escuelas e ON ae.id_escuela = e.id_escuela
                            WHERE a.dni_alumno = ?`;

    const valor : unknown[] = [dni_alumno];
    
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
};




export const dataEscuela = async ( id_escuela : number)
:Promise<TipadoData<EscuelaData>> =>{
    const sql : string = `SELECT 
                            dni_propietario,
                            nombre_propietario,
                            apellido_propietario,
                            razon_social,
                            direccion,
                            celular
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

    console.log( data)

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
                            WHERE pe.id_escuela = 107 
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

export const method = {

    obtenerEscuelasPorAlumno : tryCatchDatos( obtenerEscuelasPorAlumno ),
    obtenerClasesEscuelasHoy : tryCatchDatos( obtenerClasesEscuelasHoy),
    obtenerDniAlumno : tryCatchDatos( obtenerDniAlumno),
    dataEscuela    : tryCatchDatos( dataEscuela ),
    inscripcionActual : tryCatchDatos( inscripcionActual),
    planesActivos : tryCatchDatos( planesActivos),
    horarioEscuela : tryCatchDatos( horarioEscuela),
};