import  { Response , Request } from "express";
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";
import { method as asistenciaServicio } from "../Servicio/asistencia.servicio";
import { handleControladores } from "../utils/handleControladores";
// ──────────────────────────────────────────────────────────────
// Sección de Typado
// ──────────────────────────────────────────────────────────────
import { CodigoEstadoHTTP } from "../tipados/generico";
import { MAPA_ALTA_ASISTENCIA, ERROR_INTERNO_SERVIDOR,
         MAPA_CLASES_ASISTENCIA, MAPA_DATA_ASISTENCIA, MAPA_INFO_ALUMNO,
         MAPA_LISTADO_ASISTENCIAS
 } from "../respuestas/asistencia";
import { AsistenciaManualInputs, InfoAlumnoInputs, BuscarAlumnoInputs } from "../squemas/asistencias";
import { InfoAlumnoResult } from "../tipados/asistencia.tipado";
import { ListadoAsistenciaRow } from "../data/asistencia.data";

/**
 * Datos crudos del listado de asistencias tal como llegan por la query.
 *
 * `pagina` y `limit` son opcionales a proposito: si no vienen se mandan
 * `undefined` para que Zod aplique sus `.default()` (1 y 15). `desde` y
 * `hasta` no se sanean: si faltan, Zod responde 400.
 */
interface ListadoAsistenciasQuery {
    id_escuela: number;
    desde: string;
    hasta: string;
    dia_semana: string | null;
    hora: string | null;
    dni_profesor: string | null;
    id_nivel: number | null;
    id_tipo_clase: number | null;
    pagina?: string;
    limit?: string;
}

/**
 * Devuelve el texto recortado de un valor de query, o `null` si no vino o
 * vino vacio.
 *
 * Es clave para los filtros opcionales: el cliente manda `""` cuando el
 * filtro esta vacio, y `z.string().min(1)` rechazaria ese `""` con un 400.
 *
 * @param {unknown} v - Valor de `req.query`.
 * @returns {string | null} Texto utilizable o `null`.
 */
const textoONull = (v: unknown): string | null =>
    typeof v === "string" && v.trim() !== "" ? v.trim() : null;

/**
 * Devuelve el numero de un valor de query, o `null` si no vino o vino vacio.
 *
 * **No** sanea el contenido: `"abc"` se convierte en `NaN` y Zod lo rechaza
 * (400), igual que `"0"` en `limit` por su `.min(1)`. Sanear a mano
 * escondería el error del cliente.
 *
 * @param {unknown} v - Valor de `req.query`.
 * @returns {number | null} Numero a validar por Zod, o `null`.
 */
const numeroONull = (v: unknown): number | null =>
    typeof v === "string" && v.trim() !== "" ? Number(v) : null;


/**
 * Procesa el alta de una asistencia para un alumno en una escuela específica.
 * * La función extrae el `id_escuela` directamente del token del usuario (req.usuario) 
 * y combina los datos del cuerpo de la petición con la lógica de servicio.
 * * @async
 * @function altaAsistencia
 * @param {Request} req - Objeto de petición de Express. Debe contener:
 * - req.usuario.id_escuela: ID de la escuela extraído del token JWT.
 * - req.body: Objeto con { dni_alumno, id_inscripcion, estado, id_horario_clase }.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía una respuesta HTTP estructurada mediante `enviarResponse` o `enviarResponseError`.
 */
const altaAsistencia = async( req : Request , res: Response)=> {
   
    const data = {
        id_escuela : Number( req.usuario?.id_escuela),
        dni_alumno : Number( req.body.dni_alumno),
        id_inscripcion : Number( req.body.id_inscripcion),
        estado  : req.body.estado as string, 
    };

    const dataAsitencia = {id_horario_clase :  Number(req.body.id_horario_clase),}
    const respuestaAsistencia = await asistenciaServicio.asistencia(data, dataAsitencia);

    const config =  MAPA_ALTA_ASISTENCIA[ respuestaAsistencia.code]  || ERROR_INTERNO_SERVIDOR;

    if (config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            respuestaAsistencia.message || config.msg,
            respuestaAsistencia.data,
            undefined,
            respuestaAsistencia.code
        );
    }else{
        return enviarResponseError(
            res,            
            config.status,
            respuestaAsistencia.message || config.msg,
            respuestaAsistencia.code

        );
    };
};

/**
 * Registra una asistencia **manual** (spec 043).
 *
 * A diferencia de `altaAsistencia` (kiosko), esta ruta:
 * - no exige la ventana horaria de 15/30 minutos,
 * - sólo admite la clase que está en curso o la próxima,
 * - y bloquea la doble asistencia del mismo alumno en esa clase.
 *
 * @async
 * @function altaAsistenciaManual
 * @param {Request} req - Petición de Express con `req.usuario.id_escuela` y
 *   `req.body` = { dni_alumno, id_inscripcion, estado, id_horario_clase }.
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Envía la respuesta estructurada.
 */
const altaAsistenciaManual = async( req : Request , res: Response)=> {

    // El schema de la asistencia manual pide TODOS los campos (a diferencia
    // del kiosko, que sólo necesita el id del horario). Si se manda un
    // objeto incompleto, Zod responde "Error de validación de datos".
    const data : AsistenciaManualInputs = {
        id_escuela : Number( req.usuario?.id_escuela),
        id_horario_clase : Number( req.body.id_horario_clase),
        id_inscripcion : Number( req.body.id_inscripcion),
        dni_alumno : Number( req.body.dni_alumno),
        estado : req.body.estado as "activos" | "inactivos" | "suspendido",
    };

    await handleControladores<AsistenciaManualInputs, { idAsistencia : number, clasesRestantes : number }>(
        res, data, asistenciaServicio.asistenciaManual, MAPA_ALTA_ASISTENCIA
    );
};

/**
 * Obtiene las fechas y horarios de clases correspondientes a una escuela y estado específicos.
 * * Utiliza el `id_escuela` obtenido desde el token del usuario y el parámetro `estado` 
 * proveniente de la URL para filtrar la consulta.
 * * @async
 * @function fechasHorarios
 * @param {Request} req - Objeto de petición de Express. Debe contener:
 * - req.usuario.id_escuela: ID de la escuela extraído del token JWT.
 * - req.params.estado: El estado de las clases a consultar (ej: 'activa', 'proxima').
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía una respuesta HTTP con la lista de fechas/horarios encontrada 
 * o un error en caso de fallo.
 */
const fechasHorarios = async( req : Request, res : Response) =>{
    const data = {
        id_escuela : Number(req.usuario?.id_escuela),
        estado : req.params.estado as string  
    };

    const fechaClase_actual_proxima = await asistenciaServicio.fechaAsistencia(data);

    const config = MAPA_CLASES_ASISTENCIA[ fechaClase_actual_proxima.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK ){
        return enviarResponse(
            res,
            config.status,
            fechaClase_actual_proxima.message  || config.msg,
            fechaClase_actual_proxima.data,
            undefined,
            fechaClase_actual_proxima.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            fechaClase_actual_proxima.message  || config.msg,
            fechaClase_actual_proxima.code          
        );
    };


};

/**
 * Obtiene el historial o datos específicos de asistencia para un alumno determinado.
 * * Filtra por `id_escuela` (via token), `dni_alumno` y `estado` (via params).
 * * @async
 * @function dataAsistencia
 * @param {Request} req - Objeto de petición de Express. Debe contener:
 * - req.usuario.id_escuela: ID de la escuela extraído del token JWT.
 * - req.params.dni: DNI del alumno a consultar.
 * - req.params.estado: Estado de asistencia a filtrar.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía la respuesta con la información de asistencia o el error correspondiente.
 */
const dataAsistencia = async( req : Request, res : Response) =>{
   
    const data = {
        id_escuela : Number(req.usuario?.id_escuela),
        dni_alumno : Number(req.params.dni),
        estado : req.params.estado as string,
    };

    const dataAsitenciaResult = await asistenciaServicio.dataAsistenciaServicio(data);

    const config = MAPA_DATA_ASISTENCIA[ dataAsitenciaResult.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK ){
        return  enviarResponse(
            res,
            config.status ,
            dataAsitenciaResult.message || config.msg,
            dataAsitenciaResult.data,
            undefined,
            dataAsitenciaResult.code 
        );
    }else{
        return  enviarResponseError(
            res,
            config.status ,
            dataAsitenciaResult.message || config.msg,
            dataAsitenciaResult.code         
        );
    };
};

/**
 * Obtiene la informacion de un alumno (inscripcion vigente, clases restantes, vencimiento)
 * a partir de su DNI y la escuela del token.
 * @async
 * @function infoAlumno
 * @param {Request} req - Objeto de peticion de Express. Debe contener:
 * - req.usuario.id_escuela: ID de la escuela extraido del token JWT.
 * - req.params.dni: DNI del alumno a consultar.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envia la respuesta con la informacion del alumno o el error correspondiente.
 */
const infoAlumno = async( req : Request, res : Response) =>{
    const data : InfoAlumnoInputs = {
        id_escuela : Number(req.usuario?.id_escuela),
        dni_alumno : Number(req.params.dni),
    };
    await handleControladores<InfoAlumnoInputs, InfoAlumnoResult>(
        res, data, asistenciaServicio.infoAlumno, MAPA_INFO_ALUMNO
    );
};

/**
 * Busca alumnos por nombre, apellido o DNI para autocompletado
 * (spec 046). Devuelve hasta 10 alumnos con inscripción activa
 * de la escuela del token.
 * @async
 * @function buscarAlumno
 * @param {Request} req - Debe contener req.usuario.id_escuela (token) y
 *   req.query.termino (string 1-50).
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Envía la lista de alumnos encontrados o el error.
 */
const buscarAlumno = async( req : Request, res : Response) => {
    const data : BuscarAlumnoInputs = {
        id_escuela : Number(req.usuario?.id_escuela),
        termino : String(req.query.termino ?? ""),
    };
    await handleControladores<BuscarAlumnoInputs, InfoAlumnoResult[]>(
        res, data, asistenciaServicio.buscarAlumno, MAPA_INFO_ALUMNO
    );
};

/**
 * Lista las asistencias de la escuela del token en un rango de fechas
 * (spec 048).
 *
 * `id_escuela` sale **siempre** de `req.usuario` (token): no hay parametro
 * para pedir otra escuela. Los filtros opcionales vacios (`""`) se mandan
 * como `null` para que no fallen contra el schema, y `pagina` / `limit` se
 * dejan sin enviar cuando no vienen, para que apliquen sus defaults.
 *
 * @async
 * @function listadoAsistencias
 * @param {Request} req - Peticion de Express con `req.usuario.id_escuela` y
 *   los filtros en `req.query` (desde, hasta, dia_semana, hora, dni_profesor,
 *   id_nivel, id_tipo_clase, pagina, limit).
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Envia el listado paginado o el error correspondiente.
 */
const listadoAsistencias = async( req : Request, res : Response ) => {
    const { desde, hasta, dia_semana, hora, dni_profesor, id_nivel, id_tipo_clase, pagina, limit } = req.query;

    const datos : ListadoAsistenciasQuery = {
        // Multi-tenant: la escuela del token, nunca de la query.
        id_escuela : Number( req.usuario?.id_escuela ),
        // Las fechas NO se sanean: si faltan, el Zod responde 400.
        desde : desde as string,
        hasta : hasta as string,
        dia_semana : textoONull(dia_semana),
        hora : textoONull(hora),
        dni_profesor : textoONull(dni_profesor),
        id_nivel : numeroONull(id_nivel),
        id_tipo_clase : numeroONull(id_tipo_clase),
        pagina : typeof pagina === "string" && pagina.trim() !== "" ? pagina : undefined,
        limit : typeof limit === "string" && limit.trim() !== "" ? limit : undefined,
    };

    await handleControladores<ListadoAsistenciasQuery, ListadoAsistenciaRow[]>(
        res, datos, asistenciaServicio.listadoAsistencias, MAPA_LISTADO_ASISTENCIAS
    );
};

export const method = {
    asistencia : tryCatch( altaAsistencia),
    asistenciaManual : tryCatch( altaAsistenciaManual ),
    fechasHorarios : tryCatch( fechasHorarios),
    dataAsistencia : tryCatch( dataAsistencia ),
    infoAlumno : tryCatch( infoAlumno ),
    buscarAlumno : tryCatch( buscarAlumno ),
    listadoAsistencias : tryCatch( listadoAsistencias ),
} 