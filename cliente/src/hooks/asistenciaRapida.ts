import { useCallback, useEffect, useReducer, useRef } from "react";

import {
  initialStateAsistenciaRapida,
  asistenciaRapidaReducer,
} from "../reducers/asistenciaRapidaReducer";

import type { ApiResponse } from "../utils/apiFetch";
import { peticionComunicacion } from "../utils/canalComunicacion";
import type * as TipadoAsistencia from "../tipadosTs/asistencia.typado";

/**
 * Servicios que usa el modal de asistencia rápida.
 *
 * Cada fetch mantiene su propia firma (los de esta pantalla no son todos
 * iguales: `infoAlumno(dni)`, `borrarPlantilla(id)`,
 * `agregarAlumnosPlantilla(id, alumnos)`, etc.).
 */
export interface DataUseAsistenciaRapidaConfig {
  servicios: {
    asistenciaHorarios: (
      data: { estado: "activos" | "inactivos" }
    ) => Promise<ApiResponse<TipadoAsistencia.ResulClases_curso_proxima>>;
    infoAlumno: (
      dni: number
    ) => Promise<ApiResponse<TipadoAsistencia.InfoAlumno>>;
    buscarAlumno: (
      termino: string
    ) => Promise<ApiResponse<TipadoAsistencia.InfoAlumno[]>>;
    registroAsistenciaManual: (
      data: TipadoAsistencia.RegistroAsistencia
    ) => Promise<ApiResponse<TipadoAsistencia.ResultRegistroAsistencia>>;
    listarPlantillas: () => Promise<
      ApiResponse<TipadoAsistencia.PlantillaAsistencia[]>
    >;
    crearPlantilla: (data: {
      nombre: string;
      alumnos: number[];
    }) => Promise<ApiResponse<{ id_plantilla: number }>>;
    borrarPlantilla: (
      id: number
    ) => Promise<ApiResponse<Record<string, never>>>;
    agregarAlumnosPlantilla: (
      id: number,
      alumnos: number[]
    ) => Promise<ApiResponse<{ agregados: number }>>;
    quitarAlumnoPlantilla: (
      id: number,
      dni: number
    ) => Promise<ApiResponse<Record<string, never>>>;
  };
}

/**
 * Situación de un alumno frente a su inscripción.
 * @param {TipadoAsistencia.InfoAlumno} info - Datos del alumno.
 * @returns {TipadoAsistencia.SituacionAlumno} La situación calculada.
 */
const situacionDe = (
  info: TipadoAsistencia.InfoAlumno
): TipadoAsistencia.SituacionAlumno => {
  const estado = (info.estado ?? "").toLowerCase();
  if (estado.includes("venc")) return "vencido";
  if (estado.includes("inactiv") || estado.includes("suspend")) return "inactivo";
  if (Number(info.clases_restantes) <= 0) return "sin_clases";
  const dias = diasParaVencimiento(info.vencimiento);
  if (dias !== null && dias < 0) return "vencido";
  if (dias !== null && dias <= 7) return "por_vencer";
  return "vigente";
};

/**
 * Días que faltan para una fecha `YYYY-MM-DD`.
 * @param {string} fecha - Fecha de vencimiento.
 * @returns {number | null} Días restantes (negativo si ya venció) o `null`.
 */
export const diasParaVencimiento = (fecha: string): number | null => {
  if (!fecha) return null;
  const partes = fecha.split("-").map(Number);
  if (partes.length < 3 || partes.some((n) => !Number.isFinite(n))) return null;
  const [anio, mes, dia] = partes;
  const objetivo = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86400000);
};

/**
 * Convierte un texto en un número de DNI válido.
 * @param {string} texto - Texto a convertir.
 * @returns {number | null} El DNI o `null` si no es válido.
 */
export const aDni = (texto: string): number | null => {
  const n = Number(texto.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Hook con toda la lógica del modal de asistencia rápida manual (spec 043).
 *
 * El componente queda sólo con el JSX: el estado vive en
 * `asistenciaRapidaReducer` y las acciones viven acá.
 *
 * @param {DataUseAsistenciaRapidaConfig} config - Servicios a utilizar.
 * @param {boolean} abierto - Si el modal está abierto (controla las cargas).
 * @returns {object} Estado y handlers para el componente.
 */
export const useAsistenciaRapidaLogica = (
  config: DataUseAsistenciaRapidaConfig,
  abierto: boolean,
  onAsistenciaRegistrada?: () => void
) => {
  const [state, dispatch] = useReducer(
    asistenciaRapidaReducer,
    initialStateAsistenciaRapida()
  );

  /** Último DNI consultado: evita repetir la petición con el mismo valor. */
  const dniConsultadoRef = useRef<string>("");
  /** Timer del debounce de la búsqueda (spec 046) — campo "alumno suelto". */
  const busquedaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Timer del debounce — alta de plantilla. */
  const busquedaNuevaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Timer del debounce — agregar a plantilla existente. */
  const busquedaAgregarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { servicios } = config;

  /* ------------------------------------------------------------------
     Cargas
     ------------------------------------------------------------------ */

  /** Carga la clase que está en curso y la próxima. */
  const cargarClases = useCallback(async () => {
    dispatch({ type: "SET_CARGA", payload: { campo: "clases", valor: true } });
    const res = await servicios.asistenciaHorarios({ estado: "activos" });
    dispatch({ type: "SET_CARGA", payload: { campo: "clases", valor: false } });
    if (res.error || !res.data) return;

    const data = res.data as TipadoAsistencia.ResulClases_curso_proxima;
    const opciones: TipadoAsistencia.ClaseOpcion[] = [];
    const enCurso = data.enCursoClase as TipadoAsistencia.ResultadoClaseEnCruso;
    const proxima = data.proximaClase as TipadoAsistencia.ResultadoClaseProxima;

    if (enCurso && "id_horario_en_clase" in enCurso) {
      opciones.push({
        id: enCurso.id_horario_en_clase,
        nombre: `${enCurso.nombre_clase} (${enCurso.hora_inicio} - ${enCurso.hora_fin})`,
      });
    }
    if (proxima && "id_horario_prox_clase" in proxima) {
      opciones.push({
        id: proxima.id_horario_prox_clase,
        nombre: `${proxima.nombre_clase} (${proxima.hora_inicio} - ${proxima.hora_fin})`,
      });
    }
    dispatch({ type: "SET_CLASES", payload: opciones });
    dispatch({
      type: "SET_ID_HORARIO",
      payload: state.idHorario ?? opciones[0]?.id ?? null,
    });
  }, [servicios, state.idHorario]);

  /** Carga las plantillas y refresca la info de cada alumno. */
  const cargarPlantillas = useCallback(async () => {
    dispatch({ type: "SET_CARGA", payload: { campo: "plantillas", valor: true } });
    const res = await servicios.listarPlantillas();
    dispatch({ type: "SET_CARGA", payload: { campo: "plantillas", valor: false } });
    if (res.error || !res.data) return;

    const lista = res.data as TipadoAsistencia.PlantillaAsistencia[];
    dispatch({ type: "SET_PLANTILLAS", payload: lista });

    const nuevoInfo: Record<number, TipadoAsistencia.InfoAlumno> = {};
    for (const p of lista) {
      for (const dniAlumno of p.alumnos) {
        const r = await servicios.infoAlumno(dniAlumno);
        if (!r.error && r.data) {
          nuevoInfo[dniAlumno] = r.data as TipadoAsistencia.InfoAlumno;
        }
      }
    }
    dispatch({ type: "SET_INFO_ALUMNOS", payload: nuevoInfo });
  }, [servicios]);

  /**
   * Al abrir el modal se cargan clases y plantillas; al cerrarlo se limpia
   * todo el estado (si no, al reabrirlo quedan el DNI tipeado y los errores).
   */
  useEffect(() => {
    if (!abierto) {
      dniConsultadoRef.current = "";
      dispatch({ type: "RESET" });
      return;
    }
    void cargarClases();
    void cargarPlantillas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  /* ------------------------------------------------------------------
     Alumno suelto
     ------------------------------------------------------------------ */

  /**
   * Consulta la info de un alumno por DNI.
   * @param {string} valor - DNI a consultar.
   */
  const consultarAlumno = useCallback(
    async (valor: string) => {
      const limpio = valor.trim();
      dispatch({ type: "SET_ERROR", payload: null });
      dispatch({ type: "SET_AVISO", payload: null });
      if (limpio.length < 8) {
        dispatch({
          type: "SET_ERROR",
          payload: "El DNI debe tener al menos 8 dígitos.",
        });
        return;
      }
      dispatch({ type: "SET_ACCION", payload: "consulta" });
      try {
        const res = await servicios.infoAlumno(Number(limpio));
        if (res.error || !res.data) {
          dispatch({ type: "SET_INFO_ALUMNO", payload: null });
          dispatch({
            type: "SET_ERROR",
            payload: res.message || "No se encontró al alumno.",
          });
          return;
        }
        dispatch({
          type: "SET_INFO_ALUMNO",
          payload: res.data as TipadoAsistencia.InfoAlumno,
        });
      } finally {
        dispatch({ type: "SET_ACCION", payload: null });
      }
    },
    [servicios]
  );

  /**
   * Cambia el DNI del campo. Si queda completo (8 o 9 dígitos) se busca solo
   * al alumno, sin que el usuario tenga que apretar un botón.
   * @param {string} valor - Nuevo valor del campo.
   */
  const handleDniChange = useCallback(
    (valor: string) => {
      dispatch({ type: "SET_DNI", payload: valor });
      const limpio = valor.trim();
      if (limpio.length < 8 || limpio.length > 9) return;
      if (dniConsultadoRef.current === limpio) return;
      dniConsultadoRef.current = limpio;
      void consultarAlumno(limpio);
    },
    [consultarAlumno]
  );

  /**
   * Busca alumnos por nombre, apellido o DNI (spec 046).
   * @param {string} termino - Texto a buscar.
   */
  const buscarAlumnos = useCallback(
    async (termino: string) => {
      const limpio = termino.trim();
      if (limpio.length < 2) {
        dispatch({ type: "SET_RESULTADOS_BUSQUEDA", payload: [] });
        return;
      }
      dispatch({ type: "SET_BUSCANDO", payload: true });
      try {
        const res = await servicios.buscarAlumno(limpio);
        if (res.error || !res.data) {
          dispatch({ type: "SET_RESULTADOS_BUSQUEDA", payload: [] });
          return;
        }
        dispatch({
          type: "SET_RESULTADOS_BUSQUEDA",
          payload: res.data as TipadoAsistencia.InfoAlumno[],
        });
      } finally {
        dispatch({ type: "SET_BUSCANDO", payload: false });
      }
    },
    [servicios]
  );

  /**
   * Cambia el texto de búsqueda con debounce de 300ms (spec 046).
   * @param {string} valor - Nuevo valor del campo.
   */
  const handleBusquedaChange = useCallback(
    (valor: string) => {
      dispatch({ type: "SET_DNI", payload: valor });
      dispatch({ type: "SET_INFO_ALUMNO", payload: null });
      // Limpio el dropdown anterior para que no quede "pegado" al pasar
      // de un buscador al otro (spec 046).
      dispatch({ type: "SET_RESULTADOS_BUSQUEDA", payload: [] });
      dispatch({ type: "SET_BUSCANDO", payload: false });
      if (busquedaTimerRef.current) clearTimeout(busquedaTimerRef.current);
      busquedaTimerRef.current = setTimeout(() => {
        void buscarAlumnos(valor);
      }, 300);
    },
    [buscarAlumnos]
  );

  /**
   * Cambia el texto de búsqueda en el alta de plantilla (spec 046).
   * @param {string} valor - Nuevo valor del campo.
   */
  const handleBusquedaNueva = useCallback(
    (valor: string) => {
      dispatch({ type: "SET_DNI_NUEVO", payload: valor });
      dispatch({ type: "SET_RESULTADOS_BUSQUEDA", payload: [] });
      dispatch({ type: "SET_BUSCANDO", payload: false });
      if (busquedaNuevaTimerRef.current) clearTimeout(busquedaNuevaTimerRef.current);
      busquedaNuevaTimerRef.current = setTimeout(() => {
        void buscarAlumnos(valor);
      }, 300);
    },
    [buscarAlumnos]
  );

  /**
   * Cambia el texto de búsqueda al agregar a una plantilla existente (spec 046).
   * @param {string} valor - Nuevo valor del campo.
   */
  const handleBusquedaAgregar = useCallback(
    (valor: string) => {
      dispatch({ type: "SET_DNI_AGREGAR", payload: valor });
      dispatch({ type: "SET_RESULTADOS_BUSQUEDA", payload: [] });
      dispatch({ type: "SET_BUSCANDO", payload: false });
      if (busquedaAgregarTimerRef.current) clearTimeout(busquedaAgregarTimerRef.current);
      busquedaAgregarTimerRef.current = setTimeout(() => {
        void buscarAlumnos(valor);
      }, 300);
    },
    [buscarAlumnos]
  );

  /** Registra la asistencia de un alumno suelto. */
  const handleRegistrar = useCallback(async () => {
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_AVISO", payload: null });

    const info = state.infoAlumno;
    if (!info) {
      dispatch({
        type: "SET_ERROR",
        payload: "Primero consultá el DNI del alumno.",
      });
      return;
    }
    if (!state.idHorario) {
      dispatch({ type: "SET_ERROR", payload: "Seleccioná la clase." });
      return;
    }
    const situacion = situacionDe(info);
    if (situacion === "vencido" || situacion === "sin_clases" || situacion === "inactivo") {
      dispatch({
        type: "SET_ERROR",
        payload: "No se puede registrar: el alumno no está vigente.",
      });
      return;
    }

    dispatch({ type: "SET_ACCION", payload: "registro" });
    try {
      const res = await servicios.registroAsistenciaManual({
        dni_alumno: info.dni_alumno,
        estado: "activos",
        id_horario_clase: state.idHorario,
        id_inscripcion: info.id_inscripcion,
      });
      if (res.error) {
        dispatch({
          type: "SET_ERROR",
          payload: res.message || "No se pudo registrar la asistencia.",
        });
        return;
      }
      // Se avisa qué pasó antes de limpiar: si no, el formulario se vacía
      // y el usuario no se entera de que quedó registrada.
      const restantes = res.data?.clasesRestantes;
      dispatch({
        type: "SET_AVISO",
        payload: {
          texto:
            restantes !== undefined
              ? `Asistencia registrada a ${info.nombre_completo}. Le quedan ${restantes} clases.`
              : `Asistencia registrada a ${info.nombre_completo}.`,
          tipo: "ok",
        },
      });
      dispatch({ type: "SET_DNI", payload: "" });
      dispatch({ type: "SET_INFO_ALUMNO", payload: null });
      dniConsultadoRef.current = "";
      peticionComunicacion({
        nombreCanal: "canal_actualizar_metricas_asistencia",
        mensaje: "ACTUALIZAR",
        dispatchError: dispatch,
        error: "SET_ERROR",
      });
      onAsistenciaRegistrada?.();
    } finally {
      dispatch({ type: "SET_ACCION", payload: null });
    }
  }, [servicios, state.infoAlumno, state.idHorario, onAsistenciaRegistrada]);

  /* ------------------------------------------------------------------
     Plantillas
     ------------------------------------------------------------------ */

  /**
   * Cambia la plantilla elegida y pre-marca los alumnos que se pueden
   * registrar (los vencidos / sin clases / inactivos quedan desmarcados).
   * @param {number | null} id - Id de la plantilla.
   */
  const handleElegirPlantilla = useCallback(
    (id: number | null) => {
      dispatch({ type: "SET_PLANTILLA_SELECCIONADA", payload: id });
      dispatch({ type: "SET_ERROR", payload: null });
      if (id === null) {
        dispatch({ type: "SET_SELECCIONADOS", payload: {} });
        return;
      }
      const plantilla = state.plantillas.find((p) => p.id_plantilla === id);
      if (!plantilla) return;
      const nuevos: Record<number, boolean> = {};
      for (const dniAlumno of plantilla.alumnos) {
        const datos = state.infoAlumnos[dniAlumno];
        const situacion = datos ? situacionDe(datos) : "inactivo";
        nuevos[dniAlumno] =
          datos &&
          situacion !== "vencido" &&
          situacion !== "sin_clases" &&
          situacion !== "inactivo";
      }
      dispatch({ type: "SET_SELECCIONADOS", payload: nuevos });
    },
    [state.plantillas, state.infoAlumnos]
  );

  /**
   * Marca o desmarca un alumno del registro grupal. Sólo afecta esta
   * operación: la plantilla guardada no se modifica.
   * @param {number} dni - DNI del alumno.
   * @param {boolean} marcado - Nuevo valor de la casilla.
   */
  const handleToggleAlumno = useCallback(
    (dni: number, marcado: boolean) => {
      dispatch({
        type: "SET_SELECCIONADOS",
        payload: { ...state.seleccionados, [dni]: marcado },
      });
    },
    [state.seleccionados]
  );

  /** Registra la asistencia de los alumnos marcados de la plantilla. */
  const handleRegistrarGrupo = useCallback(async () => {
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_AVISO", payload: null });

    const plantilla = state.plantillas.find(
      (p) => p.id_plantilla === state.plantillaSeleccionada
    );
    if (!plantilla) {
      dispatch({ type: "SET_ERROR", payload: "Seleccioná una plantilla." });
      return;
    }
    if (!state.idHorario) {
      dispatch({ type: "SET_ERROR", payload: "Seleccioná la clase." });
      return;
    }
    const dnis = plantilla.alumnos.filter((d) => state.seleccionados[d]);
    if (dnis.length === 0) {
      dispatch({ type: "SET_ERROR", payload: "No hay alumnos marcados." });
      return;
    }

    dispatch({ type: "SET_ACCION", payload: "registroGrupo" });
    try {
      let ok = 0;
      let fallidos = 0;
      const motivos: string[] = [];
      for (const dniAlumno of dnis) {
        const infoRes = await servicios.infoAlumno(dniAlumno);
        if (infoRes.error || !infoRes.data) {
          fallidos += 1;
          motivos.push(`DNI ${dniAlumno}: no se pudo consultar`);
          continue;
        }
        const data = infoRes.data as TipadoAsistencia.InfoAlumno;
        const reg = await servicios.registroAsistenciaManual({
          dni_alumno: data.dni_alumno,
          estado: "activos",
          id_horario_clase: state.idHorario,
          id_inscripcion: data.id_inscripcion,
        });
        if (reg.error) {
          fallidos += 1;
          // Se guarda el motivo real: sin esto el usuario sólo veía
          // "Registrados 0, fallaron 2" sin saber por qué.
          motivos.push(
            `${data.nombre_completo}: ${reg.message || "no se pudo registrar"}`
          );
        } else {
          ok += 1;
        }
      }
      if (ok === 0 && motivos.length > 0) {
        dispatch({ type: "SET_ERROR", payload: motivos.join(" · ") });
      } else if (fallidos > 0) {
        dispatch({
          type: "SET_AVISO",
          payload: {
            texto: `Registrados ${ok} alumnos, fallaron ${fallidos}: ${motivos.join(" · ")}`,
            tipo: "parcial",
          },
        });
      } else {
        dispatch({
          type: "SET_AVISO",
          payload: { texto: `Asistencia registrada a ${ok} alumnos.`, tipo: "ok" },
        });
      }
      peticionComunicacion({
        nombreCanal: "canal_actualizar_metricas_asistencia",
        mensaje: "ACTUALIZAR",
        dispatchError: dispatch,
        error: "SET_ERROR",
      });
      if (ok > 0) {
        onAsistenciaRegistrada?.();
      }
    } finally {
      dispatch({ type: "SET_ACCION", payload: null });
    }
  }, [servicios, state.plantillas, state.plantillaSeleccionada, state.idHorario, state.seleccionados, onAsistenciaRegistrada]);

  /** Agrega un DNI a la lista de alumnos pendientes de la plantilla nueva. */
  const handleSumarPendiente = useCallback(() => {
    dispatch({ type: "SET_MENSAJE_PLANTILLAS", payload: null });
    const valor = aDni(state.dniNuevo);
    if (valor === null) {
      dispatch({
        type: "SET_MENSAJE_PLANTILLAS",
        payload: "El DNI no es válido.",
      });
      return;
    }
    if (state.alumnosPendientes.includes(valor)) {
      dispatch({
        type: "SET_MENSAJE_PLANTILLAS",
        payload: "Ese alumno ya está en la lista.",
      });
      return;
    }
    dispatch({
      type: "SET_ALUMNOS_PENDIENTES",
      payload: [...state.alumnosPendientes, valor],
    });
    dispatch({ type: "SET_DNI_NUEVO", payload: "" });
  }, [state.dniNuevo, state.alumnosPendientes]);

  /** Saca un DNI de la lista de alumnos pendientes. */
  const handleSacarPendiente = useCallback(
    (dni: number) => {
      dispatch({
        type: "SET_ALUMNOS_PENDIENTES",
        payload: state.alumnosPendientes.filter((d) => d !== dni),
      });
    },
    [state.alumnosPendientes]
  );

  /** Crea una plantilla nueva con los alumnos pendientes. */
  const handleCrearPlantilla = useCallback(async () => {
    dispatch({ type: "SET_MENSAJE_PLANTILLAS", payload: null });
    if (!state.nombrePlantilla.trim()) {
      dispatch({
        type: "SET_MENSAJE_PLANTILLAS",
        payload: "Poné un nombre para la plantilla.",
      });
      return;
    }
    if (state.alumnosPendientes.length === 0) {
      dispatch({
        type: "SET_MENSAJE_PLANTILLAS",
        payload: "Agregá al menos un alumno.",
      });
      return;
    }
    dispatch({ type: "SET_ACCION", payload: "plantilla" });
    try {
      const res = await servicios.crearPlantilla({
        nombre: state.nombrePlantilla.trim(),
        alumnos: state.alumnosPendientes,
      });
      if (res.error) {
        dispatch({
          type: "SET_MENSAJE_PLANTILLAS",
          payload: res.message || "No se pudo crear la plantilla.",
        });
        return;
      }
      dispatch({ type: "SET_NOMBRE_PLANTILLA", payload: "" });
      dispatch({ type: "SET_ALUMNOS_PENDIENTES", payload: [] });
      dispatch({ type: "SET_DNI_NUEVO", payload: "" });
      await cargarPlantillas();
    } finally {
      dispatch({ type: "SET_ACCION", payload: null });
    }
  }, [servicios, state.nombrePlantilla, state.alumnosPendientes, cargarPlantillas]);

  /** Agrega un alumno a una plantilla ya creada. */
  const handleAgregarAlumno = useCallback(
    async (idPlantilla: number, dniAlumno: number) => {
      dispatch({ type: "SET_MENSAJE_PLANTILLAS", payload: null });
      dispatch({ type: "SET_ACCION", payload: "agregarAlumno" });
      try {
        const res = await servicios.agregarAlumnosPlantilla(idPlantilla, [
          dniAlumno,
        ]);
        if (res.error) {
          dispatch({
            type: "SET_MENSAJE_PLANTILLAS",
            payload: res.message || "No se pudo agregar el alumno.",
          });
          return;
        }
        dispatch({ type: "SET_DNI_AGREGAR", payload: "" });
        await cargarPlantillas();
      } finally {
        dispatch({ type: "SET_ACCION", payload: null });
      }
    },
    [servicios, cargarPlantillas]
  );

  /** Quita un alumno de una plantilla ya creada. */
  const handleQuitarAlumno = useCallback(
    async (idPlantilla: number, dniAlumno: number) => {
      dispatch({ type: "SET_MENSAJE_PLANTILLAS", payload: null });
      dispatch({ type: "SET_ACCION", payload: "quitarAlumno" });
      try {
        const res = await servicios.quitarAlumnoPlantilla(idPlantilla, dniAlumno);
        if (res.error) {
          dispatch({
            type: "SET_MENSAJE_PLANTILLAS",
            payload: res.message || "No se pudo quitar el alumno.",
          });
          return;
        }
        await cargarPlantillas();
      } finally {
        dispatch({ type: "SET_ACCION", payload: null });
      }
    },
    [servicios, cargarPlantillas]
  );

  /** Borra una plantilla. */
  const handleBorrarPlantilla = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_MENSAJE_PLANTILLAS", payload: null });
      dispatch({ type: "SET_ACCION", payload: "plantilla" });
      try {
        const res = await servicios.borrarPlantilla(id);
        if (res.error) {
          dispatch({
            type: "SET_MENSAJE_PLANTILLAS",
            payload: res.message || "No se pudo borrar la plantilla.",
          });
          return;
        }
        if (state.plantillaSeleccionada === id) {
          dispatch({ type: "SET_PLANTILLA_SELECCIONADA", payload: null });
          dispatch({ type: "SET_SELECCIONADOS", payload: {} });
        }
        if (state.plantillaEditando === id) {
          dispatch({ type: "SET_PLANTILLA_EDITANDO", payload: null });
        }
        await cargarPlantillas();
      } finally {
        dispatch({ type: "SET_ACCION", payload: null });
      }
    },
    [servicios, state.plantillaSeleccionada, state.plantillaEditando, cargarPlantillas]
  );

  return {
    state,
    dispatch,
    situacionDe,
    handleDniChange,
    handleBusquedaChange,
    handleBusquedaNueva,
    handleBusquedaAgregar,
    buscarAlumnos,
    handleRegistrar,
    handleElegirPlantilla,
    handleToggleAlumno,
    handleRegistrarGrupo,
    handleSumarPendiente,
    handleSacarPendiente,
    handleCrearPlantilla,
    handleAgregarAlumno,
    handleQuitarAlumno,
    handleBorrarPlantilla,
  };
};
