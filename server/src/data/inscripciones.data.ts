
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { InscripcionInputs , VerificacionInputs} from "../squemas/inscripciones";
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


export const method = {
    alta  : tryCatchDatos( registroInscripcion ), 
    verificacion : tryCatchDatos( verificacion )
};