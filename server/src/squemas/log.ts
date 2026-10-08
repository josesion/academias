import { z } from "zod";

// --- 1. ESQUEMA PARA LISTADO (GET /api/logs_eventos) ---
// Todos los filtros son opcionales: sin parámetros se trae todo, ordenado del
// hecho más reciente al más viejo. `limit` se acota a 100 para que nadie pida
// la tabla entera de una.
export const EsquemaListadoLogEventos = z.object({
    pagina: z.coerce.number({ message: "pagina debe ser de tipo numerico" })
            .int({ message: "pagina debe ser un número entero." })
            .min(1, { message: "pagina debe ser un número mayor o igual a 1." })
            .default(1),

    limit: z.coerce.number({ message: "limit debe ser de tipo numerico" })
            .int({ message: "limit debe ser un número entero." })
            .positive({ message: "limit debe ser un número positivo." })
            .max(100, { message: "limit no puede superar los 100 registros." })
            .default(10),

    nivel: z.enum(["error", "warn", "info"], {
            message: "nivel debe ser 'error', 'warn' o 'info'."
    }).optional(),

    origen: z.enum(["peticion", "correo", "cron", "arranque", "servidor"], {
            message: "origen no es un valor válido."
    }).optional(),

    ruta: z.string({ message: "ruta debe ser una cadena de texto." })
            .trim()
            .min(1, { message: "ruta no puede estar vacía." })
            .max(255, { message: "ruta no puede superar los 255 caracteres." })
            .optional(),

    resuelto: z.coerce.number({ message: "resuelto debe ser 0 o 1." })
            .int({ message: "resuelto debe ser un número entero." })
            .min(0, { message: "resuelto debe ser 0 o 1." })
            .max(1, { message: "resuelto debe ser 0 o 1." })
            .optional(),

    // Se recibe como texto para poder mandarla por query string; Zod exige el formato.
    fecha_desde: z.string({ message: "fecha_desde debe ser una fecha." })
            .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "fecha_desde debe tener formato AAAA-MM-DD." })
            .optional()
});

// --- 2. ESQUEMA PARA MARCAR COMO REVISADO (PUT /api/logs_eventos_marcar) ---
// Solo cambia la bandera `resuelto` (0 = pendiente, 1 = revisado); el registro
// en sí jamás se edita ni se borra.
export const EsquemaMarcarLogEventos = z.object({
    id_log: z.coerce.number({ message: "id_log debe ser de tipo numerico" })
            .int({ message: "id_log debe ser un número entero." })
            .positive({ message: "id_log debe ser un número positivo." }),

    resuelto: z.coerce.number({ message: "resuelto debe ser 0 o 1." })
            .int({ message: "resuelto debe ser un número entero." })
            .min(0, { message: "resuelto debe ser 0 o 1." })
            .max(1, { message: "resuelto debe ser 0 o 1." })
});

export type ListadoLogEventosInput = z.infer<typeof EsquemaListadoLogEventos>;
export type InputMarcarLogEventos = z.infer<typeof EsquemaMarcarLogEventos>;

/** Lo que recibe la `data`: lo ya validado por Zod + el `offset` calculado en el servicio. */
export type ListadoLogEventosParametros = ListadoLogEventosInput & { offset: number };

/**
 * Lo que llega desde `req.query`: la paginación y los filtros, con los enums
 * todavía en texto. Los valida Zod en el Servicio (`.parse()`), así que un valor
 * fuera de lista corta antes de tocar la base de datos.
 */
export type ListadoLogEventosQuery = Omit<ListadoLogEventosInput, "nivel" | "origen"> & {
    nivel?: string;
    origen?: string;
};
