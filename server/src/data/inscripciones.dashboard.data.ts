// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para el dashboard de inscripciones.
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

/**
 * Obtiene las inscripciones para el dashboard del usuario.
 *
 * Calcula los días hasta vencimiento directamente en MySQL con DATEDIFF
 * y ordena según el filtro seleccionado:
 * - "por_vencer" → ordena por fecha_fin ASC (las que vencen primero arriba).
 * - "ultimas" → ordena por fecha_inicio DESC (las más nuevas arriba).
 * - "todos" → ordena por fecha_inicio DESC (comportamiento por defecto).
 *
 * @param id_escuela - ID de la escuela del usuario autenticado.
 * @param filtro - Tipo de ordenamiento: "por_vencer" | "ultimas" | "todos".
 * @param limit - Límite de resultados (máximo 100).
 * @returns Lista de inscripciones con días hasta vencimiento.
 */
const inscripcionesDashboard = async (
    id_escuela: number,
    filtro: string,
    limit: number
) => {
    let ordenamiento = "i.fecha_inicio DESC";

    if (filtro === "por_vencer") {
        ordenamiento = "i.fecha_fin ASC";
    } else if (filtro === "ultimas") {
        ordenamiento = "i.fecha_inicio DESC";
    }

    const slqListado = `
        SELECT
            i.id_inscripcion,
            i.dni_alumno,
            CONCAT(a.nombre, ' ', a.apellido) AS nombre_completo,
            COALESCE(pe.nombre_personalizado, p.descripcion_plan) AS nombre_plan,
            DATE_FORMAT(i.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
            DATE_FORMAT(i.fecha_fin, '%Y-%m-%d') AS vigencia,
            i.monto AS monto_pagado,
            i.estado,
            DATEDIFF(i.fecha_fin, CURDATE()) AS dias_hasta_vencimiento
        FROM inscripciones i
        JOIN alumnos a ON a.dni_alumno = i.dni_alumno
        JOIN planes_pago p ON p.id_plan = i.id_plan
        LEFT JOIN planes_en_escuela pe ON (i.id_plan = pe.id_plan AND i.id_escuela = pe.id_escuela)
        WHERE i.id_escuela = ?
        ORDER BY ${ordenamiento}
        LIMIT ${limit}
    `;

    const valores: unknown[] = [id_escuela];

    return await listarEntidadSinPaginacion({
        slqListado,
        valores,
        entidad: "Inscripciones",
        estado: "dashboard"
    });
};

export const method = {
    inscripcionesDashboard: tryCatchDatos(inscripcionesDashboard)
};
