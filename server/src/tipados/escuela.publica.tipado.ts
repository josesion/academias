/**
 * Fila de la tabla `escuelas` que expone el listado público
 * (`GET /api/escuelas_publicas`, spec 054).
 *
 * Es una lista blanca de 6 columnas: no incluye `dni_propietario`,
 * `public_id`, `correo`, `fecha_registro` ni `baja`.
 *
 * `urlImagen` llega ya normalizada por la SQL (`NULLIF(urlImagen, '')`), así
 * que un string vacío en la BD se traduce a `null` y el cliente tiene una
 * única condición que evaluar.
 */
export interface EscuelaPublicaRow {
    id_escuela: number;
    razon_social: string | null;
    direccion: string | null;
    celular: string | null;
    urlImagen: string | null;
    rubro: string | null;
}
