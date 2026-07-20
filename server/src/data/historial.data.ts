import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";
import { HistorialInputs, GetHistorialInputs } from "../squemas/historial";

export type ModuloHistorial =
    | "ALUMNOS"
    | "PROFESORES"
    | "PLANES"
    | "INSCRIPCIONES"
    | "CAJA"
    | "HORARIOS"
    | "USUARIOS"
    | "GENEROS_MUSICALES"
    | "NIVELES_BAILE"
    | "TIPOS_BAILE"
    | "CATEGORIAS_CAJA"
    | "METODOS_PAGO"
    | "ASISTENCIAS";


export type AccionHistorial =
    | "CREAR"
    | "MODIFICAR"
    | "ELIMINAR"
    | "RESTAURAR"
| "ANULACION"    
    | "ABRIR"
    | "CERRAR"
    | "INGRESO"
    | "EGRESO"
    | "LOGIN"
    | "LOGOUT";

export type IdRegistro =  number | null | undefined ;

export interface ResultPostHistorial {
     modulo : ModuloHistorial, accion : AccionHistorial , id_registro : IdRegistro  
};


/**
 * Registra una nueva entrada en el historial de acciones del sistema.
 * 
 * Esta función recibe los datos de la acción realizada, los serializa en formato JSON 
 * y ejecuta una inserción en la base de datos a través del manejador `iudEntidad`.
 *
 * @async
 * @function postHistorial
 * @param {HistorialInputs} data - Objeto con los datos necesarios para el registro del historial.
 * @param {number|string} data.id_escuela - Identificador de la institución o academia.
 * @param {number|string} data.id_usuario - Identificador del usuario que realizó la acción.
 * @param {string} data.modulo - Nombre del módulo donde ocurrió la acción (ej: 'ASISTENCIA', 'HORARIOS').
 * @param {string} data.accion - Tipo de acción realizada (ej: 'CREAR', 'MODIFICAR', 'ELIMINAR').
 * @param {number|string} data.id_registro - ID del registro afectado en la base de datos.
 * @param {string} data.descripcion - Breve descripción legible de la acción realizada.
 * @param {any} data.datos - Objeto o estructura con la información detallada (payload) que se guardará como JSON.
 * 
 * @returns {Promise<TipadoData<ResultPostHistorial>>} Promesa que resuelve con el resultado de la operación `iudEntidad`.
 * 
 * @example
 * await postHistorial({
 *   id_escuela: 1,
 *   id_usuario: 10,
 *   modulo: 'ASISTENCIA',
 *   accion: 'CREAR',
 *   id_registro: 505,
 *   descripcion: 'Se registró asistencia del alumno',
 *   datos: { presente: true, fecha: '2026-07-18' }
 * });
 */
const postHistorial = async ( data : HistorialInputs)
:Promise<TipadoData<ResultPostHistorial>> =>{
    const {id_escuela, id_usuario, modulo, accion , id_registro, descripcion ,datos} =  data;
    const sql: string = `INSERT INTO historial
                            (
                                id_escuela,
                                id_usuario,
                                modulo,
                                accion,
                                id_registro,
                                descripcion,
                                datos
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?);`;

    const valores : unknown[] = [
        id_escuela,
        id_usuario,
        modulo,
        accion,
        id_registro,
        descripcion,
        JSON.stringify(datos)
    ];
    const retorno = { modulo , accion, id_registro};

    return iudEntidad<ResultPostHistorial>({
        slqEntidad : sql,
        valores : valores,
        entidad : "HISTORIAL_POST",
        metodo  : "CREAR",
        datosRetorno : retorno
    });

};


export interface ResultHistorial {
    id_historial : number,
    modulo : ModuloHistorial,
    accion : AccionHistorial,
    descripcion : string,
    fecha  : Date,
    nombre : string,
    apellido : string
};

/**
 * Obtiene el historial reciente de acciones del sistema para una escuela específica.
 * 
 * Realiza un `INNER JOIN` con la tabla de usuarios para recuperar el nombre y apellido 
 * del responsable de cada acción. Devuelve los últimos 12 registros ordenados de forma 
 * descendente por fecha.
 *
 * @async
 * @function getHistorial
 * @param {GetHistorialInputs} id_escuela - Objeto que contiene el ID de la escuela para filtrar el historial.
 * @param {number|string} id_escuela.id_escuela - El identificador único de la escuela.
 * 
 * @returns {Promise<TipadoData<ResultHistorial[]>>} Una promesa que resuelve con un array de objetos `ResultHistorial`, 
 * conteniendo el detalle del historial y la información del usuario asociado.
 * 
 * @example
 * const historial = await getHistorial({ id_escuela: 1 });
 * // Devuelve los últimos 12 eventos registrados en la escuela con ID 1.
 */
const getHistorial  = async ( id_escuela : GetHistorialInputs)
:Promise<TipadoData<ResultHistorial[]>> =>{

   const sql: string = `SELECT
                            h.id_historial,
                            h.modulo,
                            h.accion,
                            h.descripcion,
                            h.fecha,
                            u.nombre,
                            u.apellido
                        FROM historial h
                        INNER JOIN usuarios u
                        ON h.id_usuario = u.id_usuario
                        WHERE h.id_escuela = ?
                        ORDER BY h.fecha DESC
                        LIMIT 12;`;

   const valor : unknown[] = [ id_escuela.id_escuela ];
   return listarEntidadSinPaginacion<ResultHistorial>({
        slqListado : sql, 
        valores : valor,
        entidad :  "HISTORIAL_LISTADO",
        estado  : "Actividad reciente"
   }); 
}; 

export const method = {
    postHistorial : tryCatchDatos( postHistorial), 
    getHistorial  : tryCatchDatos( getHistorial ),
};