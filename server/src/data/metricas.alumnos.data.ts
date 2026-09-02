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


export const method = {

    obtenerEscuelasPorAlumno : tryCatchDatos( obtenerEscuelasPorAlumno ),
    obtenerClasesEscuelasHoy : tryCatchDatos( obtenerClasesEscuelasHoy),
    obtenerDniAlumno : tryCatchDatos( obtenerDniAlumno),

};