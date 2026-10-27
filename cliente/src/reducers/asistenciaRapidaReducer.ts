import type * as TipadoAsistencia from "../tipadosTs/asistencia.typado";

// ==========================================
// 1. DEFINICIÓN DEL ESTADO (MOLDE)
// ==========================================

/**
 * Estado del modal de asistencia rápida manual (spec 043).
 *
 * Va en su propio reducer (no en `asistenciaReducer`) porque el kiosko y la
 * asistencia manual son flujos distintos: el kiosko marca un alumno con la
 * clase detectada automáticamente, y la asistencia manual permite elegir la
 * clase, usar plantillas y registrar grupos.
 */
export interface AsistenciaRapidaTipado {
  // --- navegación ---
  /** Pestaña principal visible. */
  tab: "asistencia" | "plantillas";
  /** Sub-modo de la pestaña "asistencia". */
  modo: "alumno" | "plantilla";

  // --- alumno suelto ---
  /** DNI tipeado. */
  dni: string;
  /** Info del alumno consultado (null si no hay). */
  infoAlumno: TipadoAsistencia.InfoAlumno | null;
  /** Resultados de la búsqueda de alumnos (spec 046). */
  resultadosBusqueda: TipadoAsistencia.InfoAlumno[];
  /** Flag de carga de la búsqueda (spec 046). */
  buscando: boolean;

  // --- clases ---
  /** Clases disponibles (la que está en curso y la próxima). */
  opcionesClase: TipadoAsistencia.ClaseOpcion[];
  /** Id del horario de clase elegido. */
  idHorario: number | null;

  // --- plantillas ---
  /** Plantillas de la escuela. */
  plantillas: TipadoAsistencia.PlantillaAsistencia[];
  /** Info de cada alumno que aparece en alguna plantilla (por DNI). */
  infoAlumnos: Record<number, TipadoAsistencia.InfoAlumno>;
  /** Alumnos marcados para el registro grupal (por DNI). */
  seleccionados: Record<number, boolean>;
  /** Plantilla elegida para el registro grupal. */
  plantillaSeleccionada: number | null;
  /** Plantilla cuyo listado de alumnos se está editando. */
  plantillaEditando: number | null;

  // --- alta de plantilla ---
  /** Nombre de la plantilla nueva. */
  nombrePlantilla: string;
  /** DNI tipeado para sumar a la plantilla nueva. */
  dniNuevo: string;
  /** Alumnos ya cargados en la plantilla nueva (aún no guardada). */
  alumnosPendientes: number[];
  /** DNI tipeado para sumar a una plantilla ya creada. */
  dniAgregar: string;

  // --- carga y mensajes ---
  /** Flags de carga. */
  carga: {
    clases: boolean;
    plantillas: boolean;
  };
  /** Acción en curso (para el spinner del botón). */
  accion: TipadoAsistencia.AccionAsistenciaRapida;
  /** Mensaje de error. */
  error: string | null;
  /** Mensaje de error de la gestión de plantillas. */
  mensajePlantillas: string | null;
  /** Aviso de éxito o parcial. */
  aviso: { texto: string; tipo: "ok" | "parcial" } | null;
}

// ==========================================
// 2. VALORES INICIALES (ESTADO CERO)
// ==========================================

/** Estado inicial del modal de asistencia rápida. */
export const initialStateAsistenciaRapida = (): AsistenciaRapidaTipado => ({
  tab: "asistencia",
  modo: "alumno",

  dni: "",
  infoAlumno: null,
  resultadosBusqueda: [],
  buscando: false,

  opcionesClase: [],
  idHorario: null,

  plantillas: [],
  infoAlumnos: {},
  seleccionados: {},
  plantillaSeleccionada: null,
  plantillaEditando: null,

  nombrePlantilla: "",
  dniNuevo: "",
  alumnosPendientes: [],
  dniAgregar: "",

  carga: {
    clases: false,
    plantillas: false,
  },
  accion: null,
  error: null,
  mensajePlantillas: null,
  aviso: null,
});

// ==========================================
// 3. ACCIONES (EVENTOS DEL SISTEMA)
// ==========================================

/** Acciones del reducer de la asistencia rápida. */
export type AsistenciaRapidaAction =
  | { type: "SET_TAB"; payload: "asistencia" | "plantillas" }
  | { type: "SET_MODO"; payload: "alumno" | "plantilla" }
  | { type: "SET_DNI"; payload: string }
  | { type: "SET_INFO_ALUMNO"; payload: TipadoAsistencia.InfoAlumno | null }
  | { type: "SET_RESULTADOS_BUSQUEDA"; payload: TipadoAsistencia.InfoAlumno[] }
  | { type: "SET_BUSCANDO"; payload: boolean }
  | { type: "SET_CLASES"; payload: TipadoAsistencia.ClaseOpcion[] }
  | { type: "SET_ID_HORARIO"; payload: number | null }
  | { type: "SET_PLANTILLAS"; payload: TipadoAsistencia.PlantillaAsistencia[] }
  | { type: "SET_INFO_ALUMNOS"; payload: Record<number, TipadoAsistencia.InfoAlumno> }
  | { type: "SET_SELECCIONADOS"; payload: Record<number, boolean> }
  | { type: "SET_PLANTILLA_SELECCIONADA"; payload: number | null }
  | { type: "SET_PLANTILLA_EDITANDO"; payload: number | null }
  | { type: "SET_NOMBRE_PLANTILLA"; payload: string }
  | { type: "SET_DNI_NUEVO"; payload: string }
  | { type: "SET_ALUMNOS_PENDIENTES"; payload: number[] }
  | { type: "SET_DNI_AGREGAR"; payload: string }
  | { type: "SET_CARGA"; payload: { campo: "clases" | "plantillas"; valor: boolean } }
  | { type: "SET_ACCION"; payload: TipadoAsistencia.AccionAsistenciaRapida }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_MENSAJE_PLANTILLAS"; payload: string | null }
  | { type: "SET_AVISO"; payload: { texto: string; tipo: "ok" | "parcial" } | null }
  | { type: "RESET" };

/**
 * Reducer del modal de asistencia rápida manual (spec 043).
 *
 * @param {AsistenciaRapidaTipado} state - Estado actual.
 * @param {AsistenciaRapidaAction} action - Acción a aplicar.
 * @returns {AsistenciaRapidaTipado} El nuevo estado.
 */
export const asistenciaRapidaReducer = (
  state: AsistenciaRapidaTipado,
  action: AsistenciaRapidaAction
): AsistenciaRapidaTipado => {
  switch (action.type) {
    case "SET_TAB":
      return {
        ...state, tab: action.payload, error: null, aviso: null,
        dni: "", infoAlumno: null, resultadosBusqueda: [], buscando: false,
        dniNuevo: "", dniAgregar: "",
      };

    case "SET_MODO":
      return {
        ...state, modo: action.payload, error: null, aviso: null,
        dni: "", infoAlumno: null, resultadosBusqueda: [], buscando: false,
        dniNuevo: "", dniAgregar: "",
      };

    case "SET_DNI":
      return { ...state, dni: action.payload };

    case "SET_INFO_ALUMNO":
      return { ...state, infoAlumno: action.payload };

    case "SET_RESULTADOS_BUSQUEDA":
      return { ...state, resultadosBusqueda: action.payload };

    case "SET_BUSCANDO":
      return { ...state, buscando: action.payload };

    case "SET_CLASES":
      return { ...state, opcionesClase: action.payload };

    case "SET_ID_HORARIO":
      return { ...state, idHorario: action.payload };

    case "SET_PLANTILLAS":
      return { ...state, plantillas: action.payload };

    case "SET_INFO_ALUMNOS":
      return { ...state, infoAlumnos: action.payload };

    case "SET_SELECCIONADOS":
      return { ...state, seleccionados: action.payload };

    case "SET_PLANTILLA_SELECCIONADA":
      return { ...state, plantillaSeleccionada: action.payload };

    case "SET_PLANTILLA_EDITANDO":
      return { ...state, plantillaEditando: action.payload };

    case "SET_NOMBRE_PLANTILLA":
      return { ...state, nombrePlantilla: action.payload };

    case "SET_DNI_NUEVO":
      return { ...state, dniNuevo: action.payload };

    case "SET_ALUMNOS_PENDIENTES":
      return { ...state, alumnosPendientes: action.payload };

    case "SET_DNI_AGREGAR":
      return { ...state, dniAgregar: action.payload };

    case "SET_CARGA":
      return {
        ...state,
        carga: { ...state.carga, [action.payload.campo]: action.payload.valor },
      };

    case "SET_ACCION":
      return { ...state, accion: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_MENSAJE_PLANTILLAS":
      return { ...state, mensajePlantillas: action.payload };

    case "SET_AVISO":
      return { ...state, aviso: action.payload };

    case "RESET":
      return initialStateAsistenciaRapida();

    default:
      return state;
  }
};
