import { type PaginacionProps } from "./genericos";

/**
 * Estado de una asistencia tal como lo devuelve el backend
 * (`ENUM('presente','ausente','justificado')`).
 */
export type EstadoAsistenciaListado = "presente" | "ausente" | "justificado";

/**
 * Una fila del listado de asistencias (spec 048).
 *
 * Los datos de la clase (hora, día, profesor, nivel y tipo) salen de la
 * **foto** guardada en la propia asistencia, no del horario actual. Por eso
 * pueden ser `null`: una asistencia registrada antes del backfill no tiene
 * foto. Los tres **textos** (`profesor`, `nivel`, `tipo_clase`) nunca son
 * `null` porque el SQL los resuelve a "Sin profesor" / "Sin nivel" / "Sin tipo".
 */
export interface AsistenciaListadoItem {
  /** PK de `asistencias`. */
  id_asistencia: number;
  /** Fecha de la asistencia en formato `YYYY-MM-DD`. */
  fecha: string;
  /** Hora de inicio de la clase (`HH:MM`), o `null` si la fila no tiene foto. */
  hora_inicio: string | null;
  /** Día de la semana sin tildes (`"miercoles"`), o `null` si no tiene foto. */
  dia_semana: string | null;
  /** Horario de clase del que salió la foto. */
  id_horario_clase: number;
  /** DNI del alumno que asistió. */
  dni_alumno: number;
  /** Nombre y apellido del alumno. */
  alumno: string;
  /** DNI del profesor de la foto (`VARCHAR` en BD), o `null` si no tiene foto. */
  dni_profesor: string | null;
  /** Nombre del profesor de la foto. Nunca `null` (el SQL pone "Sin profesor"). */
  profesor: string;
  /** Id del nivel de la foto, o `null` si no tiene foto. */
  id_nivel: number | null;
  /** Nombre del nivel de la foto. Nunca `null` (el SQL pone "Sin nivel"). */
  nivel: string;
  /** Id del tipo de clase de la foto, o `null` si no tiene foto. */
  id_tipo_clase: number | null;
  /** Nombre del tipo de clase de la foto. Nunca `null` (el SQL pone "Sin tipo"). */
  tipo_clase: string;
  /** Estado de la asistencia. */
  estado: EstadoAsistenciaListado;
}

/**
 * Filtros del listado de asistencias.
 *
 * Los cinco primeros van al backend como texto vacío (`""`) cuando no se
 * eligen: el servidor los convierte en `null`. `desde` y `hasta` son
 * **obligatorios** en el endpoint y siempre viajan.
 */
export interface FiltroListadoAsistencias {
  /** Día de la semana sin tildes (`lunes` … `domingo`). */
  dia_semana: string;
  /** Hora exacta de inicio en formato `HH:MM` (`08:00` … `23:00`). */
  hora: string;
  /** DNI del profesor (llega como texto desde el `<select>`). */
  dni_profesor: string;
  /** Id del nivel (llega como texto desde el `<select>`). */
  id_nivel: string;
  /** Id del tipo de clase (llega como texto desde el `<select>`). */
  id_tipo_clase: string;
  /** Fecha inicial del rango (`YYYY-MM-DD`). Obligatoria. */
  desde: string;
  /** Fecha final del rango (`YYYY-MM-DD`). Obligatoria. */
  hasta: string;
  /** Página pedida (1-based). */
  pagina: number;
  /** Filas por página (el backend admite como máximo 100). */
  limit: number;
}

/**
 * Opción de los `<SelectorOpt>` que no salen de un catálogo del backend (día y
 * hora): el valor que viaja y la etiqueta que se lee.
 */
export interface OpcionListadoAsistencias {
  valor: string;
  etiqueta: string;
}

/**
 * Fila que devuelve `listadoProfesoresSinPag`.
 *
 * Las claves son **`Dni` / `Nombre` / `Apellido`**, con mayúscula, porque así
 * están los alias del `SELECT` en `server/src/data/profesores.data.ts`. El tipo
 * del cliente que ya existe (`ProfesoresDataResponse`) declara `dni/nombre/
 * apellido` y **no coincide con el runtime**, por eso se define acá.
 */
export interface ProfesorOpcion {
  Dni: string;
  Nombre: string;
  Apellido: string;
}

/** Fila que devuelve `listadoNivelSinPaginacion` (`{ id, nivel }`). */
export interface NivelOpcion {
  id: number;
  nivel: string;
}

/** Fila que devuelve `listadoTipoSinPaginacion` (`{ id, tipo }`). */
export interface TipoOpcion {
  id: number;
  tipo: string;
}

/**
 * `paginacion` que devuelve `GET /api/lista_asistencias`.
 *
 * El `ApiResponse` de `utils/apiFetch` declara la paginación con **tres**
 * campos; el servidor manda además `totalRegistros` (ver
 * `Servicio/asistencia.servicio.ts`). Se declara acá para poder leerlo con un
 * casteo explícito y sin `any`.
 */
export interface PaginacionListadoAsistencias {
  pagina: number;
  limite: number;
  contadorPagina: number;
  totalRegistros: number;
}

/** Estado completo de la página de listado de asistencias. */
export interface ListadoAsistenciasState {
  /** Filtros vigentes (son los que se mandan al endpoint). */
  filtroData: FiltroListadoAsistencias;
  /** Filas de la página actual. */
  listado: AsistenciaListadoItem[];
  /** Paginación que devolvió el servidor. */
  barraPaginacion: PaginacionProps;
  /** Hay una petición del listado en vuelo. */
  carga: boolean;
  /** Mensaje de error del listado (o del timeout). */
  errorGenerico: string | null;
  /** Contador que, al cambiar, vuelve a pedir el listado. */
  actualizarListado: number;
  /** Catálogos de los `<select>` (se piden una sola vez). */
  catalogos: {
    profesores: ProfesorOpcion[];
    niveles: NivelOpcion[];
    tipos: TipoOpcion[];
    carga: boolean;
  };
}

/** Acciones que entiende `listadoAsistenciasReducer`. */
export type ListadoAsistenciasAction =
  | { type: "SET_FILTRO_DATA"; payload: Partial<FiltroListadoAsistencias> }
  | { type: "SET_LISTADO"; payload: AsistenciaListadoItem[] }
  | { type: "SET_BARRA_PAGINACION"; payload: PaginacionProps }
  | { type: "SET_CARGA"; payload: boolean }
  | { type: "SET_ERROR_GENERICO"; payload: string | null }
  | { type: "SET_ACTUALIZAR_LISTADO" }
  | {
      type: "SET_CATALOGOS";
      payload: {
        profesores: ProfesorOpcion[];
        niveles: NivelOpcion[];
        tipos: TipoOpcion[];
      };
    }
  | { type: "SET_CARGA_CATALOGOS"; payload: boolean };
