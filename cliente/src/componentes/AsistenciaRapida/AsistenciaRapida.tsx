import { useEffect, useMemo, useRef, useState } from "react";

import * as AsistenciaFetch from "../../servicio/asistencia.fetch";
import type * as TipadoAsistencia from "../../tipadosTs/asistencia.typado";

import { Boton } from "../generales/Boton/Boton";
import { Inputs } from "../generales/Inputs/Inputs";
import { SelectorOpt } from "../generales/CompSelecObt/SelectorOpt";
import { CompoError } from "../generales/Error/Error";
import { useModalAccesible } from "../../hooks/useModalAccesible";

import "./AsistenciaRapida.css";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

/** Modo de la pestaña de asistencia. */
type ModoAsistencia = "alumno" | "plantilla";

/** Acción en curso (para mostrar el spinner sólo en el botón correspondiente). */
type AccionEnCurso =
  | "consulta"
  | "registro"
  | "plantilla"
  | "agregarAlumno"
  | "quitarAlumno"
  | "registroGrupo"
  | null;

/** Opción del selector de clases. */
type ClaseOpcion = { id: number; nombre: string };

/** Opción del selector de plantillas. */
type PlantillaOpcion = { id: number; nombre: string; etiqueta: string };

/** Situación de un alumno frente a su inscripción. */
type SituacionAlumno =
  | "vigente"
  | "por_vencer"
  | "vencido"
  | "sin_clases"
  | "inactivo";

/** Etiquetas y clases de cada situación. */
const SITUACIONES: Record<
  SituacionAlumno,
  { texto: string; clase: string; bloqueado: boolean }
> = {
  vigente: { texto: "Vigente", clase: "situacion_vigente", bloqueado: false },
  por_vencer: {
    texto: "Por vencer",
    clase: "situacion_por_vencer",
    bloqueado: false,
  },
  vencido: { texto: "Vencido", clase: "situacion_vencido", bloqueado: true },
  sin_clases: {
    texto: "Sin clases",
    clase: "situacion_sin_clases",
    bloqueado: true,
  },
  inactivo: { texto: "Inactivo", clase: "situacion_inactivo", bloqueado: true },
};

/**
 * Convierte un texto en un número de DNI válido.
 * @param {string} texto - Texto a convertir.
 * @returns {number | null} El DNI o `null` si no es válido.
 */
const aDni = (texto: string): number | null => {
  const n = Number(texto.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Días que faltan para una fecha `YYYY-MM-DD`.
 * @param {string} fecha - Fecha de vencimiento.
 * @returns {number | null} Días restantes (negativo si ya venció) o `null`.
 */
const diasParaVencimiento = (fecha: string): number | null => {
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
 * Calcula la situación de un alumno a partir de la info que devuelve el
 * endpoint `/api/info_alumno/:dni`.
 * @param {TipadoAsistencia.InfoAlumno} info - Datos del alumno.
 * @returns {SituacionAlumno} Situación calculada.
 */
const situacionDe = (info: TipadoAsistencia.InfoAlumno): SituacionAlumno => {
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
 * Modal de asistencia rápida manual.
 *
 * Dos pestañas:
 * - **Asistencia**: registrar un alumno suelto (por DNI) o aplicar una
 *   plantilla de alumnos en bloque.
 * - **Plantillas**: crear, listar, editar y borrar plantillas.
 *
 * Reutiliza los componentes del proyecto (`Boton`, `Inputs`, `SelectorOpt`,
 * `CompoError`) y el hook `useModalAccesible` (foco, trampa de Tab, Escape).
 */
export const AsistenciaRapida = ({ abierto, onCerrar }: Props) => {
  const { refDialog } = useModalAccesible({ abierto, onCerrar });

  const [tab, setTab] = useState<"asistencia" | "plantillas">("asistencia");
  const [modo, setModo] = useState<ModoAsistencia>("alumno");
  const [accion, setAccion] = useState<AccionEnCurso>(null);

  // --- Alumno suelto ---
  const [dni, setDni] = useState("");
  const [info, setInfo] = useState<TipadoAsistencia.InfoAlumno | null>(null);
  const [error, setError] = useState<string>("");
  const [aviso, setAviso] = useState<{ texto: string; tipo: "ok" | "parcial" } | null>(null);
  const dniRef = useRef<HTMLInputElement>(null);
  const dniConsultadoRef = useRef<string>("");

  // --- Clases ---
  const [opcionesClase, setOpcionesClase] = useState<ClaseOpcion[]>([]);
  const [idHorario, setIdHorario] = useState<number | null>(null);

  // --- Plantillas ---
  const [plantillas, setPlantillas] = useState<TipadoAsistencia.PlantillaAsistencia[]>([]);
  const [infoAlumnos, setInfoAlumnos] = useState<
    Record<number, TipadoAsistencia.InfoAlumno>
  >({});
  const [seleccionados, setSeleccionados] = useState<Record<number, boolean>>({});
  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [dniNuevo, setDniNuevo] = useState("");
  const [alumnosPendientes, setAlumnosPendientes] = useState<number[]>([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<number | null>(null);
  const [plantillaEditando, setPlantillaEditando] = useState<number | null>(null);
  const [dniAgregar, setDniAgregar] = useState("");
  const [mensajePlantillas, setMensajePlantillas] = useState<string>("");

  /* ------------------------------------------------------------------
     Cargas
     ------------------------------------------------------------------ */

  /** Carga las clases del día (la que está en curso y la próxima). */
  const cargarClases = async (): Promise<void> => {
    const res = await AsistenciaFetch.asistenciaHorarios({ estado: "activos" });
    if (res.error || !res.data) return;
    const data = res.data as TipadoAsistencia.ResulClases_curso_proxima;
    const opciones: ClaseOpcion[] = [];
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
    setOpcionesClase(opciones);
    setIdHorario((actual) => actual ?? opciones[0]?.id ?? null);
  };

  /** Carga las plantillas y refresca la info de cada alumno. */
  const cargarPlantillas = async (): Promise<void> => {
    const res = await AsistenciaFetch.listarPlantillas();
    if (res.error || !res.data) return;
    const lista = res.data as TipadoAsistencia.PlantillaAsistencia[];
    setPlantillas(lista);

    const nuevoInfo: Record<number, TipadoAsistencia.InfoAlumno> = {};
    for (const p of lista) {
      for (const dniAlumno of p.alumnos) {
        const r = await AsistenciaFetch.infoAlumno(dniAlumno);
        if (!r.error && r.data) {
          nuevoInfo[dniAlumno] = r.data as TipadoAsistencia.InfoAlumno;
        }
      }
    }
    setInfoAlumnos(nuevoInfo);
  };

  /**
   * Al abrir el modal se cargan las clases y las plantillas.
   * Al cerrarlo se limpia todo el estado: si no, al reabrirlo quedan el DNI
   * tipeado, los errores y la plantilla elegida de la sesión anterior.
   */
  useEffect(() => {
    if (!abierto) {
      setDni("");
      setInfo(null);
      setError("");
      setAviso(null);
      setMensajePlantillas("");
      setIdHorario(null);
      setPlantillaSeleccionada(null);
      setPlantillaEditando(null);
      setSeleccionados({});
      setAlumnosPendientes([]);
      setDniNuevo("");
      setDniAgregar("");
      setNombrePlantilla("");
      dniConsultadoRef.current = "";
      return;
    }
    void cargarClases();
    void cargarPlantillas();
    const t = setTimeout(() => dniRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [abierto]);

  /* ------------------------------------------------------------------
     Acciones: alumno suelto
     ------------------------------------------------------------------ */

  /**
   * Consulta la info del alumno por DNI.
   * @param {string} valor - DNI a consultar (por defecto, el del campo).
   */
  const consultar = async (valor?: string): Promise<void> => {
    const limpio = (valor ?? dni).trim();
    setError("");
    setAviso(null);
    if (limpio.length < 8) {
      setError("El DNI debe tener al menos 8 dígitos.");
      return;
    }
    setAccion("consulta");
    try {
      const res = await AsistenciaFetch.infoAlumno(Number(limpio));
      if (res.error || !res.data) {
        setInfo(null);
        setError(res.message || "No se encontró al alumno.");
        return;
      }
      setInfo(res.data as TipadoAsistencia.InfoAlumno);
    } finally {
      setAccion(null);
    }
  };

  /**
   * Autoconsulta: al completar el DNI (8 o 9 dígitos) se busca solo al alumno,
   * sin que el usuario tenga que apretar "Consultar".
   */
  useEffect(() => {
    const limpio = dni.trim();
    if (limpio.length < 8 || limpio.length > 9) return;
    if (dniConsultadoRef.current === limpio) return;
    dniConsultadoRef.current = limpio;
    void consultar(limpio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dni]);

  /** Registra la asistencia de un alumno suelto. */
  const registrar = async (): Promise<void> => {
    setError("");
    setAviso(null);
    if (!info) {
      setError("Primero consultá el DNI del alumno.");
      return;
    }
    if (!idHorario) {
      setError("Seleccioná la clase.");
      return;
    }
    const situacion = situacionDe(info);
    if (SITUACIONES[situacion].bloqueado) {
      setError(`No se puede registrar: ${SITUACIONES[situacion].texto}.`);
      return;
    }
    setAccion("registro");
    try {
      const res = await AsistenciaFetch.registroAsistenciaManual({
        dni_alumno: info.dni_alumno,
        estado: "activos",
        id_horario_clase: idHorario,
        id_inscripcion: info.id_inscripcion,
      });
      if (res.error) {
        setError(res.message || "No se pudo registrar la asistencia.");
        return;
      }
      // Se avisa qué pasó antes de limpiar: si no, el formulario se vacía
      // y el usuario no se entera de que quedó registrada.
      const nombre = info.nombre_completo;
      const restantes = res.data?.clasesRestantes;
      setAviso({
        texto:
          restantes !== undefined
            ? `Asistencia registrada a ${nombre}. Le quedan ${restantes} clases.`
            : `Asistencia registrada a ${nombre}.`,
        tipo: "ok"
      });
      setDni("");
      setInfo(null);
      dniConsultadoRef.current = "";
    } finally {
      setAccion(null);
    }
  };

  /* ------------------------------------------------------------------
     Acciones: plantillas
     ------------------------------------------------------------------ */

  /** Agrega un DNI a la lista de alumnos pendientes de la plantilla nueva. */
  const sumarAlumnoPendiente = (): void => {
    setMensajePlantillas("");
    const valor = aDni(dniNuevo);
    if (valor === null) {
      setMensajePlantillas("El DNI no es válido.");
      return;
    }
    if (alumnosPendientes.includes(valor)) {
      setMensajePlantillas("Ese alumno ya está en la lista.");
      return;
    }
    setAlumnosPendientes((prev) => [...prev, valor]);
    setDniNuevo("");
  };

  /** Saca un DNI de la lista de alumnos pendientes. */
  const sacarAlumnoPendiente = (dniAlumno: number): void => {
    setAlumnosPendientes((prev) => prev.filter((d) => d !== dniAlumno));
  };

  /** Crea una plantilla nueva con los alumnos pendientes. */
  const crearPlantilla = async (): Promise<void> => {
    setMensajePlantillas("");
    if (!nombrePlantilla.trim()) {
      setMensajePlantillas("Poné un nombre para la plantilla.");
      return;
    }
    if (alumnosPendientes.length === 0) {
      setMensajePlantillas("Agregá al menos un alumno.");
      return;
    }
    setAccion("plantilla");
    try {
      const res = await AsistenciaFetch.crearPlantilla({
        nombre: nombrePlantilla.trim(),
        alumnos: alumnosPendientes,
      });
      if (res.error) {
        setMensajePlantillas(res.message || "No se pudo crear la plantilla.");
        return;
      }
      setNombrePlantilla("");
      setAlumnosPendientes([]);
      setDniNuevo("");
      await cargarPlantillas();
    } finally {
      setAccion(null);
    }
  };

  /** Agrega un alumno a una plantilla ya creada. */
  const agregarAlumnoAGrupo = async (
    idPlantilla: number,
    dniAlumno: number
  ): Promise<void> => {
    setMensajePlantillas("");
    setAccion("agregarAlumno");
    try {
      const res = await AsistenciaFetch.agregarAlumnosPlantilla(idPlantilla, [
        dniAlumno,
      ]);
      if (res.error) {
        setMensajePlantillas(res.message || "No se pudo agregar el alumno.");
        return;
      }
      setDniAgregar("");
      await cargarPlantillas();
    } finally {
      setAccion(null);
    }
  };

  /** Quita un alumno de una plantilla ya creada. */
  const quitarAlumnoDeGrupo = async (
    idPlantilla: number,
    dniAlumno: number
  ): Promise<void> => {
    setMensajePlantillas("");
    setAccion("quitarAlumno");
    try {
      const res = await AsistenciaFetch.quitarAlumnoPlantilla(idPlantilla, dniAlumno);
      if (res.error) {
        setMensajePlantillas(res.message || "No se pudo quitar el alumno.");
        return;
      }
      await cargarPlantillas();
    } finally {
      setAccion(null);
    }
  };

  /** Borra una plantilla. */
  const borrarPlantilla = async (id: number): Promise<void> => {
    setMensajePlantillas("");
    setAccion("plantilla");
    try {
      const res = await AsistenciaFetch.borrarPlantilla(id);
      if (res.error) {
        setMensajePlantillas(res.message || "No se pudo borrar la plantilla.");
        return;
      }
      if (plantillaSeleccionada === id) {
        setPlantillaSeleccionada(null);
        setSeleccionados({});
      }
      if (plantillaEditando === id) setPlantillaEditando(null);
      await cargarPlantillas();
    } finally {
      setAccion(null);
    }
  };

  /** Registra la asistencia de los alumnos marcados de la plantilla. */
  const registrarGrupo = async (): Promise<void> => {
    setError("");
    setAviso(null);
    const plantilla = plantillas.find((p) => p.id_plantilla === plantillaSeleccionada);
    if (!plantilla) {
      setError("Seleccioná una plantilla.");
      return;
    }
    if (!idHorario) {
      setError("Seleccioná la clase.");
      return;
    }
    const dnis = plantilla.alumnos.filter((d) => seleccionados[d]);
    if (dnis.length === 0) {
      setError("No hay alumnos marcados.");
      return;
    }
    setAccion("registroGrupo");
    try {
      let ok = 0;
      let fallidos = 0;
      const motivos: string[] = [];
      for (const dniAlumno of dnis) {
        const infoRes = await AsistenciaFetch.infoAlumno(dniAlumno);
        if (infoRes.error || !infoRes.data) {
          fallidos += 1;
          continue;
        }
        const data = infoRes.data as TipadoAsistencia.InfoAlumno;
        const reg = await AsistenciaFetch.registroAsistenciaManual({
          dni_alumno: data.dni_alumno,
          estado: "activos",
          id_horario_clase: idHorario,
          id_inscripcion: data.id_inscripcion,
        });
        if (reg.error) {
          fallidos += 1;
          // Se guarda el motivo real: sin esto el usuario solo veía
          // "Registrados 0, fallaron 2" sin saber por qué.
          motivos.push(`${data.nombre_completo}: ${reg.message || "no se pudo registrar"}`);
        } else {
          ok += 1;
        }
      }
      if (ok === 0 && motivos.length > 0) {
        setError(motivos.join(" · "));
      } else if (fallidos > 0) {
        setAviso({
          texto: `Registrados ${ok} alumnos, fallaron ${fallidos}: ${motivos.join(" · ")}`,
          tipo: "parcial"
        });
      } else {
        setAviso({
          texto: `Asistencia registrada a ${ok} alumnos.`,
          tipo: "ok"
        });
      }
    } finally {
      setAccion(null);
    }
  };

  /* ------------------------------------------------------------------
     Derivados
     ------------------------------------------------------------------ */

  /** Opciones del selector de clases. */
  const opcionesClaseSelector = useMemo(
    () => opcionesClase.map((c) => ({ id: c.id, nombre: c.nombre })),
    [opcionesClase]
  );

  /** Opciones del selector de plantillas. */
  const opcionesPlantillaSelector = useMemo(
    () =>
      plantillas.map((p) => ({
        id: p.id_plantilla,
        nombre: p.nombre,
        etiqueta: `${p.nombre} (${p.alumnos.length})`,
      })),
    [plantillas]
  );

  /** Plantilla actualmente elegida. */
  const plantillaActual = useMemo(
    () =>
      plantillas.find((p) => p.id_plantilla === plantillaSeleccionada) ?? null,
    [plantillas, plantillaSeleccionada]
  );

  /** Alumnos de la plantilla con su situación y si se puede marcar. */
  const filasPlantilla = useMemo(() => {
    if (!plantillaActual) return [];
    return plantillaActual.alumnos.map((dniAlumno) => {
      const datos = infoAlumnos[dniAlumno] ?? null;
      const situacion: SituacionAlumno = datos ? situacionDe(datos) : "inactivo";
      return {
        dni: dniAlumno,
        datos,
        situacion,
        bloqueado: !datos || SITUACIONES[situacion].bloqueado,
      };
    });
  }, [plantillaActual, infoAlumnos]);

  /** Cantidad de alumnos marcados para registrar. */
  const cantidadMarcados = useMemo(
    () => filasPlantilla.filter((f) => seleccionados[f.dni]).length,
    [filasPlantilla, seleccionados]
  );

  /**
   * Cambia la plantilla elegida y pre-marca los alumnos que se pueden
   * registrar. Los vencidos / sin clases / inactivos quedan desmarcados.
   */
  const elegirPlantilla = (id: number | null): void => {
    setPlantillaSeleccionada(id);
    setError("");
    if (id === null) {
      setSeleccionados({});
      return;
    }
    const plantilla = plantillas.find((p) => p.id_plantilla === id);
    if (!plantilla) return;
    const nuevos: Record<number, boolean> = {};
    for (const dniAlumno of plantilla.alumnos) {
      const datos = infoAlumnos[dniAlumno];
      const situacion = datos ? situacionDe(datos) : "inactivo";
      nuevos[dniAlumno] = datos ? !SITUACIONES[situacion].bloqueado : false;
    }
    setSeleccionados(nuevos);
  };

  if (!abierto) return null;

  /** Clase CSS de la píldora de situación. */
  const claseSituacion = (situacion: SituacionAlumno): string =>
    `situacion ${SITUACIONES[situacion].clase}`;

  return (
    <div className="modal-overlay-finanzas" role="presentation">
      <div
        ref={refDialog}
        className="modal-contenido-finanzas asistencia-rapida-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="asistencia-rapida-titulo"
      >
        <header className="modal_finanzas_header">
          <div className="libro_diario_titulo">
            <div className="libro_diario_titulo_texto">
              <h2 id="asistencia-rapida-titulo">Asistencia rápida</h2>
              <span>Registro manual de asistencia</span>
            </div>
          </div>
          <Boton clase="editar" logo="Cancel" texto="Cerrar" onClick={onCerrar} />
        </header>

        {/* Pestañas principales */}
        <div className="asistencia-rapida-tabs">
          <Boton
            clase={tab === "asistencia" ? "aceptar" : "listar"}
            texto="Asistencia"
            logo="Check"
            onClick={() => setTab("asistencia")}
          />
          <Boton
            clase={tab === "plantillas" ? "aceptar" : "listar"}
            texto="Plantillas"
            logo="List"
            onClick={() => setTab("plantillas")}
          />
        </div>

        {/* ============================================================
            PESTAÑA: ASISTENCIA
            ============================================================ */}
        {tab === "asistencia" && (
          <div className="asistencia-rapida-seccion">
            {/* Sub-modo: alumno suelto o plantilla */}
            <div className="asistencia-rapida-subpestanas">
              <button
                type="button"
                className={`asistencia_rapida_subpestana ${modo === "alumno" ? "activa" : ""}`}
                onClick={() => {
                  setModo("alumno");
                  setError("");
                }}
              >
                Alumno
              </button>
              <button
                type="button"
                className={`asistencia_rapida_subpestana ${modo === "plantilla" ? "activa" : ""}`}
                onClick={() => {
                  setModo("plantilla");
                  setError("");
                }}
              >
                Plantilla
              </button>
            </div>

            {/* ---------------- ALUMNO SUELTO ---------------- */}
            {modo === "alumno" && (
              <>
                <div className="asistencia-rapida-fila">
                  <div className="asistencia_rapida_campo_crece">
                    <Inputs
                      label="DNI del alumno"
                      name="dni"
                      type="number"
                      placeholder="Ej: 30023547"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      ref={dniRef}
                      readonly={false}
                    />
                  </div>

                </div>

                {opcionesClase.length === 0 ? (
                  <p className="asistencia-rapida-leyenda">
                    No hay clases hoy. No se puede registrar asistencia.
                  </p>
                ) : (
                  <div className="asistencia_rapida_campo">
                    <span className="asistencia_rapida_label">Clase</span>
                    <SelectorOpt<ClaseOpcion>
                      categorias={opcionesClaseSelector}
                      itemKey="id"
                      itemLabel="nombre"
                      name="clase"
                      labelDefault="Seleccioná la clase"
                      value={idHorario !== null ? String(idHorario) : ""}
                      onChangeSelector={(e) =>
                        setIdHorario(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </div>
                )}

                {info && (
                  <div className="asistencia-rapida-ficha">
                    <div className="asistencia_rapida_ficha_datos">
                      <span className="asistencia_rapida_ficha_nombre">
                        {info.nombre_completo}
                      </span>
                      <span className="asistencia_rapida_ficha_plan">
                        {info.plan}
                      </span>
                    </div>
                    <div className="asistencia_rapida_ficha_items">
                      <span className="asistencia_rapida_ficha_item">
                        <strong>{info.clases_restantes}</strong> clases restantes
                      </span>
                      <span className="asistencia_rapida_ficha_item">
                        Vence: <strong>{info.vencimiento || "-"}</strong>
                      </span>
                      <span className={claseSituacion(situacionDe(info))}>
                        {SITUACIONES[situacionDe(info)].texto}
                      </span>
                    </div>
                    <Boton
                      clase="aceptar"
                      texto="Registrar asistencia"
                      logo="Go"
                      disable={accion === "registro"}
                      onClick={registrar}
                    />
                  </div>
                )}

                {error && <CompoError mensaje={error} />}
                {aviso && (
                  <p
                    className={`asistencia_rapida_aviso ${aviso.tipo}`}
                    role="status"
                    aria-live="polite"
                  >
                    {aviso.texto}
                  </p>
                )}
              </>
            )}

            {/* ---------------- PLANTILLA ---------------- */}
            {modo === "plantilla" && (
              <>
                <div className="asistencia-rapida-dos-columnas">
                  <div className="asistencia_rapida_campo">
                    <span className="asistencia_rapida_label">Plantilla</span>
                    <SelectorOpt<PlantillaOpcion>
                      categorias={opcionesPlantillaSelector}
                      itemKey="id"
                      itemLabel="etiqueta"
                      name="plantilla"
                      labelDefault="Seleccioná la plantilla"
                      value={
                        plantillaSeleccionada !== null
                          ? String(plantillaSeleccionada)
                          : ""
                      }
                      onChangeSelector={(e) =>
                        elegirPlantilla(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </div>

                  {opcionesClase.length === 0 ? (
                    <p className="asistencia-rapida-leyenda">No hay clases hoy.</p>
                  ) : (
                    <div className="asistencia_rapida_campo">
                      <span className="asistencia_rapida_label">Clase</span>
                      <SelectorOpt<ClaseOpcion>
                        categorias={opcionesClaseSelector}
                        itemKey="id"
                        itemLabel="nombre"
                        name="claseGrupo"
                        labelDefault="Seleccioná la clase"
                        value={idHorario !== null ? String(idHorario) : ""}
                        onChangeSelector={(e) =>
                          setIdHorario(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                {plantillaActual && (
                  <div className="asistencia-rapida-tabla-wrapper">
                    <table className="asistencia_rapida_tabla">
                      <thead>
                        <tr>
                          <th scope="col" className="col_casilla">
                            <span className="visually-hidden">Registrar</span>
                          </th>
                          <th scope="col">Alumno</th>
                          <th scope="col">Clases</th>
                          <th scope="col">Vencimiento</th>
                          <th scope="col">Situación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filasPlantilla.map((fila) => (
                          <tr
                            key={fila.dni}
                            className={fila.bloqueado ? "fila_bloqueada" : ""}
                          >
                            <td className="col_casilla">
                              <input
                                type="checkbox"
                                checked={Boolean(seleccionados[fila.dni])}
                                disabled={fila.bloqueado}
                                aria-label={`Registrar al alumno ${fila.dni}`}
                                onChange={(e) =>
                                  setSeleccionados((prev) => ({
                                    ...prev,
                                    [fila.dni]: e.target.checked,
                                  }))
                                }
                              />
                            </td>
                            <td>
                              <span className="celda_alumno_nombre">
                                {fila.datos?.nombre_completo ?? `DNI ${fila.dni}`}
                              </span>
                              <span className="celda_alumno_dni">
                                DNI {fila.dni}
                              </span>
                            </td>
                            <td>{fila.datos ? fila.datos.clases_restantes : "-"}</td>
                            <td>{fila.datos?.vencimiento || "-"}</td>
                            <td>
                              <span className={claseSituacion(fila.situacion)}>
                                {fila.datos
                                  ? SITUACIONES[fila.situacion].texto
                                  : "Sin datos"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {plantillaActual && (
                  <div className="asistencia-rapida-acciones">
                    <span className="asistencia_rapida_contador">
                      {cantidadMarcados} alumno
                      {cantidadMarcados === 1 ? "" : "s"} marcado
                      {cantidadMarcados === 1 ? "" : "s"}
                    </span>
                    <Boton
                      clase="aceptar"
                      texto="Registrar grupo"
                      logo="Go"
                      disable={
                        accion === "registroGrupo" || cantidadMarcados === 0
                      }
                      onClick={registrarGrupo}
                    />
                  </div>
                )}

                {error && <CompoError mensaje={error} />}
                {aviso && (
                  <p
                    className={`asistencia_rapida_aviso ${aviso.tipo}`}
                    role="status"
                    aria-live="polite"
                  >
                    {aviso.texto}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ============================================================
            PESTAÑA: GESTIÓN DE PLANTILLAS
            ============================================================ */}
        {tab === "plantillas" && (
          <div className="asistencia-rapida-seccion">
            {/* ---------- Crear plantilla nueva ---------- */}
            <div className="asistencia_rapida_bloque">
              <h3 className="asistencia_rapida_bloque_titulo">Nueva plantilla</h3>

              <div className="asistencia-rapida-dos-columnas">
                <Inputs
                  label="Nombre de la plantilla"
                  name="nombrePlantilla"
                  type="text"
                  placeholder="Ej: Grupo lunes"
                  value={nombrePlantilla}
                  onChange={(e) => setNombrePlantilla(e.target.value)}
                  readonly={false}
                />
                <Inputs
                  label="DNI del alumno"
                  name="dniNuevo"
                  type="number"
                  placeholder="Ej: 30023547"
                  value={dniNuevo}
                  onChange={(e) => setDniNuevo(e.target.value)}
                  readonly={false}
                />
              </div>

              <div className="asistencia-rapida-acciones">
                <Boton
                  clase="agregar"
                  texto="Agregar alumno"
                  logo="Add"
                  onClick={sumarAlumnoPendiente}
                />
                <span className="asistencia_rapida_contador">
                  {alumnosPendientes.length} alumno
                  {alumnosPendientes.length === 1 ? "" : "s"} en la lista
                </span>
              </div>

              {alumnosPendientes.length > 0 && (
                <ul className="asistencia_rapida_chips">
                  {alumnosPendientes.map((dniAlumno) => (
                    <li key={dniAlumno} className="asistencia_rapida_chip">
                      <span>
                        {infoAlumnos[dniAlumno]?.nombre_completo ??
                          `DNI ${dniAlumno}`}
                      </span>
                      <button
                        type="button"
                        aria-label={`Quitar DNI ${dniAlumno} de la lista`}
                        onClick={() => sacarAlumnoPendiente(dniAlumno)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="asistencia-rapida-acciones">
                <Boton
                  clase="aceptar"
                  texto="Crear plantilla"
                  logo="Check"
                  disable={accion === "plantilla"}
                  onClick={crearPlantilla}
                />
              </div>
            </div>

            {mensajePlantillas && <CompoError mensaje={mensajePlantillas} />}

            {/* ---------- Listado ---------- */}
            <div className="asistencia-rapida-lista">
              {plantillas.length === 0 ? (
                <p className="asistencia-rapida-leyenda">
                  Todavía no creaste ninguna plantilla.
                </p>
              ) : (
                plantillas.map((p) => (
                  <div key={p.id_plantilla} className="asistencia-rapida-plantilla">
                    <div className="asistencia-rapida-plantilla-header">
                      <div>
                        <strong>{p.nombre}</strong>
                        <span className="asistencia_rapida_plantilla_cantidad">
                          {p.alumnos.length} alumno
                          {p.alumnos.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="asistencia-rapida-acciones">
                        <Boton
                          clase="listar"
                          texto="Usar"
                          logo="Check"
                          size={16}
                          onClick={() => {
                            setTab("asistencia");
                            setModo("plantilla");
                            elegirPlantilla(p.id_plantilla);
                          }}
                        />
                        <Boton
                          clase="flechas"
                          texto={
                            plantillaEditando === p.id_plantilla
                              ? "Cerrar"
                              : "Alumnos"
                          }
                          logo="Edit"
                          size={16}
                          onClick={() =>
                            setPlantillaEditando(
                              plantillaEditando === p.id_plantilla
                                ? null
                                : p.id_plantilla
                            )
                          }
                        />
                        <Boton
                          clase="eliminar"
                          texto="Borrar"
                          logo="Delete"
                          size={16}
                          disable={accion === "plantilla"}
                          onClick={() => borrarPlantilla(p.id_plantilla)}
                        />
                      </div>
                    </div>

                    <ul className="asistencia_rapida_plantilla_alumnos">
                      {p.alumnos.map((dniAlumno) => {
                        const datos = infoAlumnos[dniAlumno];
                        return (
                          <li key={dniAlumno}>
                            <span>
                              {datos?.nombre_completo ?? `DNI ${dniAlumno}`}
                              {datos && (
                                <span className="celda_alumno_dni">
                                  {" "}
                                  · {datos.clases_restantes} clases · vence{" "}
                                  {datos.vencimiento || "-"}
                                </span>
                              )}
                            </span>
                            {plantillaEditando === p.id_plantilla && (
                              <button
                                type="button"
                                className="asistencia_rapida_quitar"
                                aria-label={`Quitar DNI ${dniAlumno} de la plantilla`}
                                disabled={accion === "quitarAlumno"}
                                onClick={() =>
                                  quitarAlumnoDeGrupo(p.id_plantilla, dniAlumno)
                                }
                              >
                                Quitar
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {/* Agregar alumno a un grupo ya creado */}
                    {plantillaEditando === p.id_plantilla && (
                      <div className="asistencia_rapida_agregar_alumno">
                        <Inputs
                          label="DNI del alumno a agregar"
                          name={`dniAgregar_${p.id_plantilla}`}
                          type="number"
                          placeholder="Ej: 30123456"
                          value={dniAgregar}
                          onChange={(e) => setDniAgregar(e.target.value)}
                          readonly={false}
                        />
                        <Boton
                          clase="agregar"
                          texto="Agregar al grupo"
                          logo="Add"
                          disable={accion === "agregarAlumno"}
                          onClick={() => {
                            const valor = aDni(dniAgregar);
                            if (valor === null) {
                              setMensajePlantillas("El DNI no es válido.");
                              return;
                            }
                            void agregarAlumnoAGrupo(p.id_plantilla, valor);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
