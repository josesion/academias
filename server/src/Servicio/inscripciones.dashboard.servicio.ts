// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────

import { tryCatchDatos } from "../utils/tryCatchBD";

// ──────────────────────────────────────────────────────────────
// Sección de Datos
// ──────────────────────────────────────────────────────────────

import { method as inscripcionesDashboardData } from "../data/inscripciones.dashboard.data";

// ──────────────────────────────────────────────────────────────
// Sección de Esquemas
// ──────────────────────────────────────────────────────────────

import { DashboardInscripcionesSchema, DashboardInscripcionesInputs } from "../squemas/inscripciones";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────

import { TipadoData } from "../tipados/tipado.data";

/**
 * Servicio para obtener inscripciones del dashboard.
 *
 * Valida los parámetros de entrada con Zod, llama a la capa de datos
 * y traduce los códigos de respuesta a códigos propios del servicio.
 *
 * @param data - Objeto con id_escuela, filtro y limit.
 * @returns Lista de inscripciones con días hasta vencimiento.
 */
const inscripcionesDashboardServicio = async (
    data: DashboardInscripcionesInputs
): Promise<TipadoData<any[]>> => {

    const validData = DashboardInscripcionesSchema.parse(data);

    const resultado = await inscripcionesDashboardData.inscripcionesDashboard(
        validData.id_escuela,
        validData.filtro,
        validData.limit
    );

    if (resultado.code === "INSCRIPCIONES_LISTED") {
        return {
            error: false,
            message: "Inscripciones del dashboard obtenidas",
            data: resultado.data,
            code: "DASHBOARD_INSCRIPCIONES_OK"
        };
    }

    if (resultado.code === "NO_ACTIVE_INSCRIPCIONES") {
        return {
            error: true,
            message: "No se encontraron inscripciones",
            data: [],
            code: "DASHBOARD_INSCRIPCIONES_VACIO"
        };
    }

    return {
        error: true,
        message: "Error al obtener las inscripciones del dashboard",
        code: "ERROR_DASHBOARD_INSCRIPCIONES"
    };
};

export const method = {
    inscripcionesDashboardServicio: tryCatchDatos(inscripcionesDashboardServicio)
};
