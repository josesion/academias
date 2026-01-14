
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { InscripcionInputs , VerificacionInputs , VerificarPlanAsistenciaUnputs, ResultInscripcionAsistencia } from "../squemas/inscripciones";
import { TipadoData } from "../tipados/tipado.data";


/**
 * Verifica si un alumno ya posee una inscripción con un estado específico (ej. 'activos')
 * en una escuela determinada.
 * * Esta función se usa para aplicar una regla de negocio que previene la duplicación
 * de inscripciones activas (evitando conflictos 409).
 *
 * @param {VerificacionInputs} data - Objeto con los datos clave para la verificación.
 * @param {number} data.dni_alumno - El DNI del alumno a verificar.
 * @param {number} data.id_escuela - El ID de la escuela donde se busca la inscripción.
 * @param {string} data.estado - El estado de la inscripción a buscar (ej: 'activos').
 * @returns {Promise<TipadoData<{id_inscripcion: number }>>} Una promesa que resuelve con
 * un objeto que contiene el ID de la inscripción si existe, o null/undefined
 * si no se encuentra (dependiendo de la implementación de buscarExistenteEntidad).
 */

const verificacion = async( data : VerificacionInputs ) 
: Promise<TipadoData<{id_inscripcion: number }>> => {
     const {dni_alumno , id_escuela , estado} = data;

    const sql : string = `select id_inscripcion from inscripciones 
                          where 
                             dni_alumno = ? and estado = ? and id_escuela = ? ;`;
    const valores : unknown[] = [dni_alumno , estado , id_escuela]; 

    return await buscarExistenteEntidad<{id_inscripcion: number }>({
        slqEntidad : sql,
        valores ,
        entidad : 'Inscripcion'
    });
};

/**
 * Registra una nueva inscripción en la base de datos con todos los detalles
 * del plan (snapshot) y las fechas.
 * * @param {InscripcionInputs} data - Objeto con todos los campos necesarios para la nueva inscripción.
 * @param {number} data.id_plan - ID del plan asociado a la inscripción.
 * @param {number} data.id_escuela - ID de la escuela donde se registra la inscripción.
 * @param {number} data.dni_alumno - DNI del alumno inscrito.
 * @param {string} data.fecha_inicio - Fecha de inicio de la inscripción (AAAA-MM-DD).
 * @param {string | null | undefined} data.fecha_fin - Fecha de fin de la inscripción (AAAA-MM-DD), puede ser nulo.
 * @param {number} data.monto - Monto pagado por el plan (snapshot del precio).
 * @param {number} data.clases_asignadas_inscritas - Número de clases asignadas (snapshot).
 * @param {number} data.meses_asignados_inscritos - Número de meses asignados (snapshot).
 * @returns {Promise<TipadoData<{ id_plan: number, dni_alumno: number }>>} Una promesa que resuelve con
 * el ID del plan y el DNI del alumno para confirmar la creación.
 */

const registroInscripcion = async( data : InscripcionInputs) 
: Promise<TipadoData<{ id_plan : number , dni_alumno : number }>> =>{

    

    const { id_plan, id_escuela ,dni_alumno ,fecha_inicio ,fecha_fin ,
            clases_asignadas_inscritas , meses_asignados_inscritos ,monto
    } = data ;


 
    const sql : string = `INSERT INTO inscripciones (
                            id_plan, 
                            id_escuela, 
                            dni_alumno, 
                            fecha_inicio, 
                            fecha_fin, 
                            monto, 
                            clases_asignadas_inscritas, 
                            meses_asignados_inscritos
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?
                        );`;
    const valores : unknown[] = [id_plan,id_escuela, dni_alumno , fecha_inicio ,fecha_fin ,monto , clases_asignadas_inscritas , meses_asignados_inscritos];
    const datosRetorno  = { id_plan , dni_alumno }

    return await iudEntidad<{ id_plan : number , dni_alumno : number }>({
        slqEntidad : sql,
        valores ,
        entidad : "Inscripciones",
        metodo  : "CREAR",
        datosRetorno : datosRetorno
    });

};

/**
 * Consulta la vigencia de la inscripción y calcula el saldo de clases disponibles.
 * * Esta función realiza un cálculo dinámico cruzando la inscripción con el histórico 
 * de asistencias para determinar cuántos créditos le quedan al alumno.
 * * @param {VerificarPlanAsistenciaUnputs} data
 * Objeto con los criterios de búsqueda:
 * - dni_alumno: Documento del alumno a consultar.
 * - estado: Estado de la inscripción (ej: 'activos').
 * - id_escuela: Identificador de la institución.
 * * @returns {Promise<TipadoData<ResultInscripcionAsistencia>>}
 * Retorna una promesa con el resultado de `buscarExistenteEntidad`:
 * - id_inscripcion: ID único del plan contratado.
 * - vencimiento: Fecha de fin del plan formateada como 'YYYY-MM-DD'.
 * - clases_restantes: Resultado de (clases totales - asistencias consumidas).
 * * @remarks
 * - Utiliza `DATE_FORMAT` para evitar problemas de conversión de zona horaria en el cliente.
 * - Emplea un `LEFT JOIN` para asegurar que el cálculo funcione incluso si el alumno posee 0 asistencias.
 * - Requiere `GROUP BY` debido a la función de agregación `COUNT`.
 * * @sqlLogic
 * El saldo de clases se calcula mediante la fórmula:
 * `(clases_por_mes * meses_contratados) - asistencias_registradas`
 */
const verificarPlanAsistencia = async( data : VerificarPlanAsistenciaUnputs)
: Promise<TipadoData<ResultInscripcionAsistencia>> => {
    const {dni_alumno ,estado ,id_escuela, } = data;
    const sql : string = `SELECT 
                                i.id_inscripcion,
                                DATE_FORMAT(i.fecha_fin, '%Y-%m-%d') AS vencimiento,
                                ((i.clases_asignadas_inscritas * i.meses_asignados_inscritos) - COUNT(a.id_asistencia)) AS clases_restantes
                            FROM inscripciones i
                            LEFT JOIN asistencias a 
                                ON i.id_inscripcion = a.id_inscripcion
                            WHERE 
                                i.dni_alumno = ?
                                AND i.estado = ? 
                                AND i.id_escuela = ?
                            GROUP BY i.id_inscripcion;`;
    const valores : unknown[] = [ dni_alumno, estado , id_escuela];
    return await buscarExistenteEntidad<ResultInscripcionAsistencia>({
        slqEntidad : sql,
        valores ,
        entidad : "inscripcion"
    });
};


export const method = {
    alta  : tryCatchDatos( registroInscripcion ), 
    verificacion : tryCatchDatos( verificacion ),
    verificarPlanAsistencia : tryCatchDatos(  verificarPlanAsistencia ), 
};