import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataEscuelasPublicas } from "../data/escuelas.publicas.data";

import { TipadoData } from "../tipados/tipado.data";
import { EscuelaPublicaRow } from "../tipados/escuela.publica.tipado";

/**
 * Servicio del listado público de escuelas (spec 054).
 *
 * No lleva Zod: la ruta no recibe `params`, `query` ni `body`, así que no hay
 * entradas que validar (ver `plan.md` §3.3).
 *
 * Traduce los códigos de la capa data a los del contrato público. En
 * particular, `NO_ACTIVE_ESCUELAS_PUBLICAS` (que el hook genérico devuelve con
 * `error: true` cuando no hay filas) se **reescribe como éxito** con
 * `data: []`: un catálogo vacío no es un fallo y el Login debe mostrar un
 * estado vacío, no un cartel de error.
 *
 * @returns Respuesta tipada con las escuelas públicas activas o el error.
 */
const listarEscuelasPublicas = async (): Promise<TipadoData<EscuelaPublicaRow[]>> => {

    const resultado = await dataEscuelasPublicas.listarEscuelasPublicas();

    if (resultado.code === "ESCUELAS_PUBLICAS_LISTED") {
        return {
            error: false,
            message: "Listado de escuelas públicas obtenido correctamente.",
            code: "LISTADO_ESCUELAS_PUBLICAS_OK",
            data: resultado.data
        };
    }

    if (resultado.code === "NO_ACTIVE_ESCUELAS_PUBLICAS") {
        return {
            error: false,
            message: "Todavía no hay escuelas publicadas.",
            code: "LISTADO_ESCUELAS_PUBLICAS_VACIO",
            data: []
        };
    }

    return {
        error: true,
        message: "Error en el servidor, listado de escuelas públicas.",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Colección de métodos del servicio del listado público de escuelas.
 */
export const method = {
    listarEscuelasPublicas: tryCatchDatos(listarEscuelasPublicas)
};
