
import { tryCatchDatos } from "../utils/tryCatchBD";
import { ClientError } from "../utils/error";
import { CrearInputsPlanes  , ModInputsPlanes ,ListaInputsPlanes} from "../squemas/planes";
import { iud, select } from "../utils/baseDatos";
import { TipadoData, DataPlan, DataPlanesListado, DataPlanMod } from "../tipados/tipado.data";


/**
 * Crea un nuevo plan mensual en la base de datos a partir de los parámetros proporcionados.
 *
 * @param {CrearInputsPlanes} params - Objeto con los datos necesarios para crear el plan.
 * @param {string} params.descripcion - Descripción del plan.
 * @param {number} params.limites_cedes - Cantidad máxima de sedes permitidas en el plan.
 * @param {number} params.precio_mensual - Precio mensual del plan.
 * @param {boolean} params.estado - Estado del plan (activo o inactivo).
 *
 * @returns {Promise<TipadoData<DataPlan>>} Promesa que resuelve con un objeto indicando éxito o error.
 *
 * @throws {ClientError} Si no se logra insertar el plan en la base de datos.
 *
 * @example
 * const nuevoPlan = await crearPlan({
 *   descripcion: "Plan Profesional",
 *   limites_cedes: 5,
 *   precio_mensual: 199.99,
 *   estado: true
 * });
 */
const crearPlan = async (
    params: CrearInputsPlanes
): Promise<TipadoData<DataPlan>> => {
    const { descripcion, limites_cedes, precio_mensual, estado } = params;

    const sql = `
        INSERT INTO planes_mensuales_admin (descripcion, limites_cedes, precio_mensual, estado)
        VALUES (?, ?, ?, ?);
    `;

    const valores = [descripcion, limites_cedes, precio_mensual, estado];
    const resultado = await iud(sql, valores);

    if (resultado.affectedRows === 0) {
        throw new ClientError("No se pudo crear el plan", 500, "CREATION_FAILED");
    }

    return {
        error: false,
        message: "Plan creado exitosamente",
        data: { descripcion, limites_cedes, precio_mensual, estado },
        code: "PLAN_CREATED",
        errorsDetails: undefined
    };
};



/**
 * Modifica un plan mensual existente en la base de datos con los datos proporcionados.
 *
 * @param {ModInputsPlanes} params - Objeto con los campos necesarios para modificar el plan.
 * @param {number} params.id - ID del plan que se desea modificar.
 * @param {string} params.descripcion - Nueva descripción del plan.
 * @param {number} params.limites_cedes - Nueva cantidad máxima de sedes permitidas.
 * @param {number} params.precio_mensual - Nuevo precio mensual del plan.
 * @param {boolean} params.estado - Nuevo estado del plan (activo o inactivo).
 *
 * @returns {Promise<TipadoData<DataPlanMod>>} Promesa que resuelve con un objeto indicando éxito o error.
 *
 * @throws {ClientError} Si no se pudo modificar el plan (ninguna fila fue afectada).
 *
 * @example
 * const resultado = await modPlanes({
 *   id: 3,
 *   descripcion: "Plan Empresarial",
 *   limites_cedes: 10,
 *   precio_mensual: 299.99,
 *   estado: true
 * });
 */
const modPlanes = async (
    params: ModInputsPlanes
): Promise<TipadoData<DataPlanMod>> => {
    const { id, descripcion, limites_cedes, precio_mensual, estado } = params;

    const sql = `
        UPDATE planes_mensuales_admin
        SET
            descripcion = ?,
            limites_cedes = ?,
            precio_mensual = ?,
            estado = ?
        WHERE
            id = ?;
    `;

    const valores = [descripcion, limites_cedes, precio_mensual, estado, id];
    const resultado = await iud(sql, valores);

    if (resultado.affectedRows === 0) {
        throw new ClientError("No se pudo modificar el plan", 500, "UPDATE_FAILED");
    }

    return {
        error: false,
        message: "Plan modificado correctamente",
        data: { id, descripcion, limites_cedes, precio_mensual, estado },
        code: "PLAN_UPDATED",
        errorsDetails: undefined
    };
};


/**
 * Lista planes mensuales desde la base de datos con filtros, ordenamiento y paginación.
 *
 * @param {ListaInputsPlanes} params - Objeto con filtros y parámetros de control.
 * @param {boolean} params.estado - Filtra planes por estado (activo/inactivo).
 * @param {string} params.orden - Campo por el cual se ordenarán los resultados (ej: "id ASC", "precio_mensual DESC").
 * @param {number} params.limit - Número máximo de resultados por página.
 * @param {number} params.offset - Desplazamiento (cuántos resultados omitir) para paginación.
 * @param {string} params.descripcion - Filtro por coincidencia parcial al inicio de la descripción del plan.
 *
 * @param {string} pagina - Número de página actual como string (usualmente provisto desde query params).
 *
 * @returns {Promise<TipadoData<DataPlanesListado[]>>} Promesa que resuelve con la lista de planes, datos de paginación y metadatos de éxito.
 *
 * @throws {ClientError} Si no se encuentran planes activos o inactivos según el filtro `estado`.
 *
 * @example
 * const resultado = await listarPlanes({
 *   estado: true,
 *   orden: "id ASC",
 *   limit: 10,
 *   offset: 0,
 *   descripcion: "Plan"
 * });
 */
export const listarPlanes = async (
    params: ListaInputsPlanes,
    pagina: string
): Promise<TipadoData<DataPlanesListado[]>> => {
    const { estado, orden, limit, offset, descripcion } = params;
    const likeDescripcion = descripcion + "%";

    const sql = `
        SELECT *
        FROM planes_mensuales_admin
        WHERE estado = ? AND descripcion LIKE ?
        ORDER BY ${orden}
        LIMIT ${limit} OFFSET ${offset};
    `;

    const sqlPagina = `
        SELECT COUNT(*) as total_pagina
        FROM planes_mensuales_admin
        WHERE estado = ? AND descripcion LIKE ?;
    `;

    const valores = [estado, likeDescripcion];
    const resultado = await select<DataPlanesListado>(sql, valores);

    if (resultado.length <= 0) {
        throw new ClientError(`No hay planes ${estado}`, 404, "NO_ACTIVE_PLANS");
    }

    const controlador = await select<{ total_pagina: number }>(sqlPagina, valores);
    const { total_pagina } = controlador[0];
    const totalPagina = Math.ceil(total_pagina / limit);

    return {
        error: false,
        message: `Planes listados ${estado}`,
        data: resultado,
        paginacion: {
            pagina: Number(pagina),
            limite: Number(limit),
            contadorPagina: totalPagina
        },
        code: "PLANS_LISTED",
        errorsDetails: undefined
    };
};



export const method = {
    crearPlan       : tryCatchDatos( crearPlan ),
    listarPlanes    : tryCatchDatos( listarPlanes ),
    modPlanes       : tryCatchDatos( modPlanes)
}