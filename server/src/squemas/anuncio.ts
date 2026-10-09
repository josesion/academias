import { z } from "zod";

/**
 * Esquemas de la entidad `anuncios` (spec 015).
 *
 * - `tipo_contacto` es OBLIGATORIO y es solo la etiqueta de como se muestra el
 *   aviso en el frontend ('whatsapp' | 'facebook' | 'instagram'). La direccion
 *   real de esa red vive en la columna correspondiente de `empresas`.
 * - `tipo_media` NO viaja del cliente: el Servicio lo deduce del `mimetype` del
 *   archivo y lo pone en el INSERT.
 * - `id_empresa` SI viaja del body (el administrador elige a que empresa
 *   pertenece el anuncio). Es la excepcion al multi-tenant, igual que el
 *   `id_escuela` de `POST /api/usuario_admin_alta`.
 */

const TIPO_CONTACTO = ["whatsapp", "facebook", "instagram"] as const;

// --- 1. ALTA (POST /api/anuncio_alta) ---
// `fecha_creacion` y `fecha_actualizacion` los pone la BD.
export const EsquemaAnuncioAlta = z.object({
    id_empresa: z.coerce.number({ message: "id_empresa debe ser de tipo numerico" })
        .int({ message: "id_empresa debe ser un numero entero." })
        .positive({ message: "id_empresa debe ser un numero positivo." }),

    titulo: z.string({ message: "titulo debe ser una cadena de texto." })
        .trim()
        .min(3, { message: "El titulo debe tener al menos 3 caracteres." })
        .max(150, { message: "El titulo no puede exceder los 150 caracteres." }),

    descripcion: z.string({ message: "descripcion debe ser una cadena de texto." })
        .trim()
        .min(5, { message: "La descripcion debe tener al menos 5 caracteres." })
        .max(1000, { message: "La descripcion no puede exceder los 1000 caracteres." }),

    tipo_contacto: z.enum(TIPO_CONTACTO, {
        message: "tipo_contacto debe ser 'whatsapp', 'facebook' o 'instagram'.",
    }),
});

// --- 2. MODIFICAR (PUT /api/anuncio_mod) ---
// El archivo es OPCIONAL: si no viene, el `public_id` y la `media_url` no se
// tocan. Todo lo demas tambien, y el SET se arma dinamico en la `data`.
export const EsquemaAnuncioMod = z.object({
    id_anuncio: z.coerce.number({ message: "id_anuncio debe ser de tipo numerico" })
        .int({ message: "id_anuncio debe ser un numero entero." })
        .positive({ message: "id_anuncio debe ser un numero positivo." }),

    id_empresa: z.coerce.number({ message: "id_empresa debe ser de tipo numerico" })
        .int({ message: "id_empresa debe ser un numero entero." })
        .positive({ message: "id_empresa debe ser un numero positivo." })
        .optional(),

    titulo: z.string({ message: "titulo debe ser una cadena de texto." })
        .trim()
        .min(3, { message: "El titulo debe tener al menos 3 caracteres." })
        .max(150, { message: "El titulo no puede exceder los 150 caracteres." })
        .optional(),

    descripcion: z.string({ message: "descripcion debe ser una cadena de texto." })
        .trim()
        .min(5, { message: "La descripcion debe tener al menos 5 caracteres." })
        .max(1000, { message: "La descripcion no puede exceder los 1000 caracteres." })
        .optional(),

    tipo_contacto: z.enum(TIPO_CONTACTO, {
        message: "tipo_contacto debe ser 'whatsapp', 'facebook' o 'instagram'.",
    }).optional(),

    // Lo pone el controlador en `true` cuando el PUT trae un archivo nuevo. No
    // es un dato de la tabla: existe para que el `.refine()` de abajo sepa que
    // reemplazar la media ES un cambio, aunque no se haya tocado ningun texto.
    cambia_media: z.boolean().optional(),
}).refine(
    (campos) => Boolean(
        campos.id_empresa ?? campos.titulo ?? campos.descripcion ??
        campos.tipo_contacto ?? campos.cambia_media
    ),
    { message: "Debe enviar al menos un campo a modificar." }
);

// --- 3. BAJA FISICA (DELETE /api/anuncio_baja) ---
// A diferencia de las empresas, aqui la fila SE BORRA (y con ella el objeto de R2).
export const EsquemaAnuncioBaja = z.object({
    id_anuncio: z.coerce.number({ message: "id_anuncio debe ser de tipo numerico" })
        .int({ message: "id_anuncio debe ser un numero entero." })
        .positive({ message: "id_anuncio debe ser un numero positivo." }),
});

// --- 4. LISTADO PAGINADO (GET /api/anuncio_lista) ---
// Los 5 filtros son opcionales: sin ninguno la SQL no tiene WHERE y trae todo,
// del anuncio mas nuevo al mas viejo. `razon_social` es PARCIAL y se busca con
// LIKE '%texto%' sobre `empresas.razon_social` (por eso el listado hace JOIN).
export const EsquemaAnuncioLista = z.object({
    pagina: z.coerce.number({ message: "pagina debe ser de tipo numerico" })
        .int({ message: "pagina debe ser un numero entero." })
        .min(1, { message: "pagina debe ser un numero mayor o igual a 1." })
        .default(1),

    limit: z.coerce.number({ message: "limit debe ser de tipo numerico" })
        .int({ message: "limit debe ser un numero entero." })
        .positive({ message: "limit debe ser un numero positivo." })
        .max(100, { message: "limit no puede superar los 100 registros." })
        .default(10),

    razon_social: z.string({ message: "razon_social debe ser una cadena de texto." })
        .trim()
        .min(1, { message: "razon_social no puede estar vacia." })
        .max(150, { message: "razon_social no puede exceder los 150 caracteres." })
        .optional(),

    tipo_media: z.enum(["imagen", "video"], {
        message: "tipo_media debe ser 'imagen' o 'video'.",
    }).optional(),

    tipo_contacto: z.enum(TIPO_CONTACTO, {
        message: "tipo_contacto debe ser 'whatsapp', 'facebook' o 'instagram'.",
    }).optional(),

    // Se reciben como texto para poder mandarlas por query string; Zod exige el
    // formato AAAA-MM-DD.
    fecha_desde: z.string({ message: "fecha_desde debe ser una fecha." })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "fecha_desde debe tener formato AAAA-MM-DD." })
        .optional(),

    fecha_hasta: z.string({ message: "fecha_hasta debe ser una fecha." })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "fecha_hasta debe tener formato AAAA-MM-DD." })
        .optional(),
});

// --- 5. LISTADO POR EMPRESA (GET /api/anuncio_lista_empresa) ---
// Sin paginacion: trae TODOS los anuncios de esa empresa. `id_empresa` es
// obligatorio.
export const EsquemaAnuncioListaEmpresa = z.object({
    id_empresa: z.coerce.number({ message: "id_empresa debe ser de tipo numerico" })
        .int({ message: "id_empresa debe ser un numero entero." })
        .positive({ message: "id_empresa debe ser un numero positivo." }),
});

// --- 6. EL ARCHIVO (viene de `req.file`, no del body) ---
// No se valida con `.parse()` en el mismo esquema que los datos de la tabla:
// se arma aparte, como hace `flayer.servicio.ts` con `GuardarImagenSchema`.
export const EsquemaMediaAnuncio = z.object({
    buffer: z.instanceof(Buffer, { message: "El archivo debe ser un buffer valido." }),

    tipo: z.string({ message: "El tipo del archivo debe ser un texto." })
        .min(1, { message: "El tipo del archivo es obligatorio." }),

    size: z.number({ message: "El tamano del archivo debe ser un numero." })
        .positive({ message: "El tamano del archivo debe ser mayor a cero." }),

    nombre: z.string({ message: "El nombre del archivo debe ser un texto." })
        .min(1, { message: "El nombre del archivo es obligatorio." }),
});

export type InputAnuncioAlta = z.infer<typeof EsquemaAnuncioAlta>;
export type InputAnuncioMod = z.infer<typeof EsquemaAnuncioMod>;
export type InputAnuncioBaja = z.infer<typeof EsquemaAnuncioBaja>;
export type ListadoAnuncioInput = z.infer<typeof EsquemaAnuncioLista>;
export type ListadoAnuncioEmpresaInput = z.infer<typeof EsquemaAnuncioListaEmpresa>;
export type MediaAnuncioInput = z.infer<typeof EsquemaMediaAnuncio>;

/** Lo que recibe la `data` del listado paginado: lo validado + el `offset`. */
export type ListadoAnuncioParametros = ListadoAnuncioInput & { offset: number };

/**
 * Lo que llega desde `req.query`: paginacion y filtros, con los enums todavia
 * en texto (los valida el `.parse()` del Servicio).
 */
export type ListadoAnuncioQuery = Omit<ListadoAnuncioInput, "tipo_media" | "tipo_contacto"> & {
    tipo_media?: string;
    tipo_contacto?: string;
};

/** Datos de la media que lee el controlador de `req.file` (viene de multer). */
export interface MediaAnuncioArchivo {
    buffer: Buffer;
    tipo: string;
    size: number;
    nombre: string;
}