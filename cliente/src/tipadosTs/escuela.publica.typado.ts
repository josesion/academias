/**
 * Rubro de una escuela tal como lo valida el alta
 * (`server/src/squemas/escuelas.ts`: `z.enum(["baile", "gym"])`).
 */
export type RubroEscuela = "baile" | "gym";

/**
 * Rubro listo para pintar en la tarjeta: cualquier valor desconocido (dato
 * viejo o typo, por ejemplo `"danza"`) cae en `"desconocido"` y la tarjeta
 * muestra el badge neutro en lugar de romperse.
 */
export type RubroTarjeta = RubroEscuela | "desconocido";

/**
 * Fila cruda de `GET /api/escuelas_publicas` (spec 054).
 *
 * Es la lista blanca de 6 columnas del endpoint: nunca llegan `dni`,
 * `propietario`, `public_id`, `correo`, `baja` ni `fecha_registro`.
 */
export interface EscuelaPublicaRow {
  id_escuela: number;
  razon_social: string | null;
  direccion: string | null;
  celular: string | null;
  /** Ya viene normalizada por la SQL: `""` se traduce a `null`. */
  urlImagen: string | null;
  rubro: string | null;
}

/**
 * Escuela ya normalizada por `useEscuelasPublicas`, lista para la tarjeta.
 *
 * `whatsapp` y `maps` son las URLs finales o `null` cuando no hay dato
 * suficiente: la tarjeta no renderiza el botón correspondiente.
 */
export interface EscuelaPublica {
  id_escuela: number;
  razon_social: string;
  direccion: string | null;
  urlImagen: string | null;
  rubro: RubroTarjeta;
  /** Dígitos listos para `wa.me` (con el prefijo `54`/`549` ya resuelto) o `""`. */
  celularDigitos: string;
  whatsapp: string | null;
  maps: string | null;
}

/** Estado que devuelve el hook `useEscuelasPublicas`. */
export interface EstadoEscuelasPublicas {
  escuelas: EscuelaPublica[];
  carga: boolean;
  error: string | null;
  recargar: () => void;
}
