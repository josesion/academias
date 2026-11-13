import { z } from "zod";

/**
 * Esquemas de la entidad `empresas` (spec 015).
 *
 * - Las tres redes (`whatsapp`, `instagram`, `facebook`) son OPCIONALES y la
 *   columna acepta NULL: si no llegan se guardan en NULL. Solo se valida el
 *   largo, sin exigir que parezcan URLs ni que el whatsapp empiece con "+".
 * - El logo es opcional y lo sube el frontend como archivo (`upload.single`).
 * - La baja es LOGICA: `DELETE /api/empresa_baja` solo manda `id_empresa` y el
 *   backend pone `estado = 'inactivos'`. La reactivacion es un PUT normal con
 *   `estado: "activos"`.
 */

// --- 1. ALTA (POST /api/empresa_alta) ---
// `estado` y `fecha_creacion` los pone la BD: no se mandan.
export const EsquemaEmpresaAlta = z.object({
    razon_social: z.string({ message: "razon_social debe ser una cadena de texto." })
        .trim()
        .min(2, { message: "La razon social debe tener al menos 2 caracteres." })
        .max(150, { message: "La razon social no puede exceder los 150 caracteres." }),

    domicilio: z.string({ message: "domicilio debe ser una cadena de texto." })
        .trim()
        .min(3, { message: "El domicilio debe tener al menos 3 caracteres." })
        .max(255, { message: "El domicilio no puede exceder los 255 caracteres." }),

    whatsapp: z.string({ message: "whatsapp debe ser una cadena de texto." })
        .trim()
        .max(255, { message: "whatsapp no puede exceder los 255 caracteres." })
        .optional(),

    instagram: z.string({ message: "instagram debe ser una cadena de texto." })
        .trim()
        .max(255, { message: "instagram no puede exceder los 255 caracteres." })
        .optional(),

    facebook: z.string({ message: "facebook debe ser una cadena de texto." })
        .trim()
        .max(255, { message: "facebook no puede exceder los 255 caracteres." })
        .optional(),
});

// --- 2. MODIFICAR (PUT /api/empresa_mod) ---
// Todo es opcional: lo que no llega no se modifica (el SET se arma dinamico en
// la `data`). `estado` si se puede tocar, y ahi esta la reactivacion de una
// empresa dada de baja. Un PUT sin nada que cambiar no tiene sentido: el SET
// quedaria vacio y la SQL seria invalida.
export const EsquemaEmpresaMod = z.object({
    id_empresa: z.coerce.number({ message: "id_empresa debe ser de tipo numerico" })
        .int({ message: "id_empresa debe ser un numero entero." })
        .positive({ message: "id_empresa debe ser un numero positivo." }),

    razon_social: z.string({ message: "razon_social debe ser una cadena de texto." })
        .trim()
        .min(2, { message: "La razon social debe tener al menos 2 caracteres." })
        .max(150, { message: "La razon social no puede exceder los 150 caracteres." })
        .optional(),

    domicilio: z.string({ message: "domicilio debe ser una cadena de texto." })
        .trim()
        .min(3, { message: "El domicilio debe tener al menos 3 caracteres." })
        .max(255, { message: "El domicilio no puede exceder los 255 caracteres." })
        .optional(),

    whatsapp: z.string({ message: "whatsapp debe ser una cadena de texto." })
        .trim()
        .max(255, { message: "whatsapp no puede exceder los 255 caracteres." })
        .optional(),

    instagram: z.string({ message: "instagram debe ser una cadena de texto." })
        .trim()
        .max(255, { message: "instagram no puede exceder los 255 caracteres." })
        .optional(),

    facebook: z.string({ message: "facebook debe ser una cadena de texto." })
        .trim()
        .max(255, { message: "facebook no puede exceder los 255 caracteres." })
        .optional(),

    estado: z.enum(["activos", "inactivos"], {
        message: "estado debe ser 'activos' o 'inactivos'.",
    }).optional(),

    // Lo pone el controlador en `true` cuando el PUT trae un logo nuevo. No es
    // un dato de la tabla: existe para que el `.refine()` de abajo sepa que
    // reemplazar el logo ES un cambio, aunque no se haya tocado ningun texto.
    cambia_logo: z.boolean().optional(),
}).refine(
    (campos) => Boolean(
        campos.razon_social ?? campos.domicilio ?? campos.whatsapp ??
        campos.instagram ?? campos.facebook ?? campos.estado ?? campos.cambia_logo
    ),
    { message: "Debe enviar al menos un campo a modificar." }
);

// --- 3. BAJA LOGICA (DELETE /api/empresa_baja) ---
// No manda `estado`: el backend SIEMPRE pone 'inactivos'.
export const EsquemaEmpresaBaja = z.object({
    id_empresa: z.coerce.number({ message: "id_empresa debe ser de tipo numerico" })
        .int({ message: "id_empresa debe ser un numero entero." })
        .positive({ message: "id_empresa debe ser un numero positivo." }),
});

// --- 4. LISTADO PAGINADO (GET /api/empresa_lista) ---
// Sin `estado` el listado trae SOLO las activas: es el caso normal de la
// pantalla. Para ver las dadas de baja hay que mandar `?estado=inactivos`.
export const EsquemaEmpresaLista = z.object({
    pagina: z.coerce.number({ message: "pagina debe ser de tipo numerico" })
        .int({ message: "pagina debe ser un numero entero." })
        .min(1, { message: "pagina debe ser un numero mayor o igual a 1." })
        .default(1),

    limit: z.coerce.number({ message: "limit debe ser de tipo numerico" })
        .int({ message: "limit debe ser un numero entero." })
        .positive({ message: "limit debe ser un numero positivo." })
        .max(100, { message: "limit no puede superar los 100 registros." })
        .default(10),

    // Parcial: se busca con LIKE '%texto%'.
    razon_social: z.string({ message: "razon_social debe ser una cadena de texto." })
        .trim()
        .min(1, { message: "razon_social no puede estar vacia." })
        .max(150, { message: "razon_social no puede exceder los 150 caracteres." })
        .optional(),

    estado: z.enum(["activos", "inactivos"], {
        message: "estado debe ser 'activos' o 'inactivos'.",
    }).optional(),
});

export type InputEmpresaAlta = z.infer<typeof EsquemaEmpresaAlta>;
export type InputEmpresaMod = z.infer<typeof EsquemaEmpresaMod>;
export type InputEmpresaBaja = z.infer<typeof EsquemaEmpresaBaja>;
export type ListadoEmpresaInput = z.infer<typeof EsquemaEmpresaLista>;

/** Lo que recibe la `data`: lo ya validado por Zod + el `offset` del Servicio. */
export type ListadoPorFiltro = ListadoEmpresaInput & { offset: number };

/**
 * Lo que llega desde `req.query`. El enum `estado` viaja como texto y lo
 * valida el `.parse()` del Servicio: asi un valor fuera de lista corta con 400
 * antes de tocar la base de datos.
 */
export type ListadoEmpresaQuery = Omit<ListadoEmpresaInput, "estado"> & {
    estado?: string;
};

/** Datos del logo que lee el controlador de `req.file` (viene de multer). */
export interface LogoEmpresaArchivo {
    buffer: Buffer;
    tipo: string;
    size: number;
    nombre: string;
}