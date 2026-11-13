import { useRef } from "react";

import { Boton } from "../generales/Boton/Boton";
import { Inputs } from "../generales/Inputs/Inputs";
import { SelectorOpt } from "../generales/CompSelecObt/SelectorOpt";
import { CompoError } from "../generales/Error/Error";
import { useModalAccesible } from "../../hooks/useModalAccesible";
import { useAsistenciaRapidaSet } from "../../hookNegocios/asistenciaRapida";

import type * as TipadoAsistencia from "../../tipadosTs/asistencia.typado";

import "./AsistenciaRapida.css";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onAsistenciaRegistrada?: () => void;
}

/* ==========================================================
   CONSTANTES Y HELPERS
   ========================================================== */

type Situacion = TipadoAsistencia.SituacionAlumno;

const TEXTO_SITUACION: Record<Situacion, string> = {
  vigente: "Vigente",
  por_vencer: "Por vencer",
  vencido: "Vencido",
  sin_clases: "Sin clases",
  inactivo: "Inactivo",
};

/** Situaciones en las que no se puede registrar asistencia. */
const SITUACIONES_BLOQUEADAS: Situacion[] = [
  "vencido",
  "sin_clases",
  "inactivo",
];

const MODOS = [
  { id: "alumno", texto: "Alumno" },
  { id: "plantilla", texto: "Plantilla" },
] as const;

const plural = (cantidad: number) => (cantidad === 1 ? "" : "s");

/* ==========================================================
   SUBCOMPONENTES (presentación pura)
   ========================================================== */

/** Píldora de situación. El color sale de `data-situacion` en el CSS. */
const PildoraSituacion = ({
  situacion,
  texto,
}: {
  situacion: Situacion;
  texto?: string;
}) => (
  <span className="asistencia_rapida_situacion" data-situacion={situacion}>
    {texto ?? TEXTO_SITUACION[situacion]}
  </span>
);

/** Selector de clase del día, con leyenda cuando no hay clases. */
const SelectorClase = ({
  opciones,
  value,
  name,
  textoVacio,
  onChange,
}: {
  opciones: TipadoAsistencia.ClaseOpcion[];
  value: number | null;
  name: string;
  textoVacio: string;
  onChange: (id: number | null) => void;
}) => {
  if (opciones.length === 0) {
    return <p className="asistencia_rapida_leyenda">{textoVacio}</p>;
  }

  return (
    <div className="asistencia_rapida_campo">
      <span className="asistencia_rapida_label">Clase</span>
      <SelectorOpt<TipadoAsistencia.ClaseOpcion>
        categorias={opciones}
        itemKey="id"
        itemLabel="nombre"
        name={name}
        labelDefault="Seleccioná la clase"
        value={value !== null ? String(value) : ""}
        onChangeSelector={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
      />
    </div>
  );
};

type ResultadoMin = {
  id_inscripcion: number | string;
  nombre_completo: string;
  dni_alumno: number | string;
};

/** Estado de búsqueda + lista de resultados (se usaba 3 veces igual). */
const ResultadosBusqueda = <T extends ResultadoMin>({
  consulta,
  buscando,
  resultados,
  onElegir,
}: {
  consulta: string;
  buscando: boolean;
  resultados: T[];
  onElegir: (resultado: T) => void;
}) => (
  <>
    {buscando && (
      <p className="asistencia_rapida_estado_busqueda" aria-live="polite">
        Buscando...
      </p>
    )}

    {resultados.length > 0 && (
      <ul className="asistencia_rapida_resultados">
        {resultados.map((r) => (
          <li key={r.id_inscripcion}>
            <button type="button" onClick={() => onElegir(r)}>
              {r.nombre_completo} · DNI {r.dni_alumno}
            </button>
          </li>
        ))}
      </ul>
    )}

    {consulta.trim().length >= 2 && !buscando && resultados.length === 0 && (
      <p className="asistencia_rapida_estado_busqueda">Sin resultados</p>
    )}
  </>
);

/** Error + aviso de éxito/parcial (se repetía en los dos modos). */
const Feedback = ({
  error,
  aviso,
}: {
  error?: string | null;
  aviso?: { tipo: string; texto: string } | null;
}) => (
  <>
    {error && <CompoError mensaje={error} />}

    {aviso && (
      <p
        className="asistencia_rapida_aviso"
        data-tipo={aviso.tipo}
        role="status"
        aria-live="polite"
      >
        {aviso.texto}
      </p>
    )}
  </>
);

/* ==========================================================
   COMPONENTE PRINCIPAL
   Modal de asistencia rápida manual (spec 043).

   Sólo presentación: el estado vive en `asistenciaRapidaReducer`
   y la lógica en `useAsistenciaRapidaLogica` (hook `asistenciaRapida`).
   ========================================================== */

export const AsistenciaRapida = ({
  abierto,
  onCerrar,
  onAsistenciaRegistrada,
}: Props) => {
  const { refDialog } = useModalAccesible({ abierto, onCerrar });

  const {
    state,
    dispatch,
    situacionDe,
    handleBusquedaChange,
    handleBusquedaNueva,
    handleBusquedaAgregar,
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
  } = useAsistenciaRapidaSet(abierto, onAsistenciaRegistrada);

  const dniRef = useRef<HTMLInputElement>(null);

  if (!abierto) return null;

  type Resultado = (typeof state.resultadosBusqueda)[number];

  /* ---------- Derivados ---------- */

  const opcionesClase = state.opcionesClase;

  const opcionesPlantilla = state.plantillas.map((p) => ({
    id: p.id_plantilla,
    nombre: p.nombre,
    etiqueta: `${p.nombre} (${p.alumnos.length})`,
  }));

  const situacionInfo = state.infoAlumno ? situacionDe(state.infoAlumno) : null;

  const filasPlantilla =
    state.plantillas
      .find((p) => p.id_plantilla === state.plantillaSeleccionada)
      ?.alumnos.map((dniAlumno) => {
        const datos = state.infoAlumnos[dniAlumno] ?? null;
        const situacion: Situacion = datos ? situacionDe(datos) : "inactivo";
        const bloqueado = !datos || SITUACIONES_BLOQUEADAS.includes(situacion);
        return { dni: dniAlumno, datos, situacion, bloqueado };
      }) ?? [];

  const cantidadMarcados = filasPlantilla.filter(
    (f) => state.seleccionados[f.dni],
  ).length;

  /* ---------- Handlers de la vista ---------- */

  const cambiarClase = (id: number | null) =>
    dispatch({ type: "SET_ID_HORARIO", payload: id });

  const elegirAlumno = (r: Resultado) => {
    dispatch({ type: "SET_INFO_ALUMNO", payload: r });
    dispatch({ type: "SET_DNI", payload: r.nombre_completo });
    dispatch({ type: "SET_RESULTADOS_BUSQUEDA", payload: [] });
  };

  const sumarPendienteDesdeBusqueda = (r: Resultado) => {
    if (!state.alumnosPendientes.includes(r.dni_alumno)) {
      dispatch({
        type: "SET_ALUMNOS_PENDIENTES",
        payload: [...state.alumnosPendientes, r.dni_alumno],
      });
    }
    dispatch({ type: "SET_DNI_NUEVO", payload: "" });
    dispatch({ type: "SET_RESULTADOS_BUSQUEDA", payload: [] });
  };

  const agregarDesdeBusqueda = (idPlantilla: number, r: Resultado) => {
    void handleAgregarAlumno(idPlantilla, r.dni_alumno);
    dispatch({ type: "SET_DNI_AGREGAR", payload: "" });
    dispatch({ type: "SET_RESULTADOS_BUSQUEDA", payload: [] });
  };

  const agregarPorDni = (idPlantilla: number) => {
    const valor = Number(state.dniAgregar.trim());
    if (!Number.isFinite(valor) || valor <= 0) {
      dispatch({
        type: "SET_MENSAJE_PLANTILLAS",
        payload: "El DNI no es válido.",
      });
      return;
    }
    void handleAgregarAlumno(idPlantilla, valor);
  };

  const usarPlantilla = (idPlantilla: number) => {
    dispatch({ type: "SET_TAB", payload: "asistencia" });
    dispatch({ type: "SET_MODO", payload: "plantilla" });
    handleElegirPlantilla(idPlantilla);
  };

  const alternarEdicion = (idPlantilla: number) =>
    dispatch({
      type: "SET_PLANTILLA_EDITANDO",
      payload: state.plantillaEditando === idPlantilla ? null : idPlantilla,
    });

  /* ---------- Render ---------- */

  return (
    <div className="modal-overlay-finanzas" role="presentation">
      <div
        ref={refDialog}
        className="modal-contenido-finanzas asistencia_rapida_modal"
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
          <Boton
            clase="editar"
            logo="Cancel"
            texto="Cerrar"
            onClick={onCerrar}
          />
        </header>

        {/* Pestañas principales */}
        <div className="asistencia_rapida_tabs">
          <Boton
            clase={state.tab === "asistencia" ? "aceptar" : "listar"}
            texto="Asistencia"
            logo="Check"
            onClick={() => dispatch({ type: "SET_TAB", payload: "asistencia" })}
          />
          <Boton
            clase={state.tab === "plantillas" ? "aceptar" : "listar"}
            texto="Plantillas"
            logo="List"
            onClick={() => dispatch({ type: "SET_TAB", payload: "plantillas" })}
          />
        </div>

        {/* ============================================================
            PESTAÑA: ASISTENCIA
            ============================================================ */}
        {state.tab === "asistencia" && (
          <div className="asistencia_rapida_seccion">
            <div className="asistencia_rapida_subpestanas">
              {MODOS.map((modo) => (
                <button
                  key={modo.id}
                  type="button"
                  className="asistencia_rapida_subpestana"
                  aria-pressed={state.modo === modo.id}
                  onClick={() =>
                    dispatch({ type: "SET_MODO", payload: modo.id })
                  }
                >
                  {modo.texto}
                </button>
              ))}
            </div>

            {/* ---------------- ALUMNO SUELTO ---------------- */}
            {state.modo === "alumno" && (
              <>
                <div className="asistencia_rapida_campo_crece">
                  <Inputs
                    label="Buscar alumno"
                    name="dni"
                    type="text"
                    placeholder="Nombre, apellido o DNI"
                    value={state.dni}
                    onChange={(e) => handleBusquedaChange(e.target.value)}
                    ref={dniRef}
                    readonly={false}
                  />
                  <ResultadosBusqueda
                    consulta={state.dni}
                    buscando={state.buscando}
                    resultados={state.resultadosBusqueda}
                    onElegir={elegirAlumno}
                  />
                </div>

                <SelectorClase
                  opciones={opcionesClase}
                  value={state.idHorario}
                  name="clase"
                  textoVacio="No hay clases hoy. No se puede registrar asistencia."
                  onChange={cambiarClase}
                />

                {state.infoAlumno && situacionInfo && (
                  <div className="asistencia_rapida_ficha">
                    <div className="asistencia_rapida_ficha_cabecera">
                      <div className="asistencia_rapida_ficha_datos">
                        <span className="asistencia_rapida_ficha_nombre">
                          {state.infoAlumno.nombre_completo}
                        </span>
                        <span className="asistencia_rapida_ficha_plan">
                          {state.infoAlumno.plan}
                        </span>
                      </div>
                      <PildoraSituacion situacion={situacionInfo} />
                    </div>

                    <div className="asistencia_rapida_ficha_items">
                      <span>
                        <strong>{state.infoAlumno.clases_restantes}</strong>{" "}
                        clases restantes
                      </span>
                      <span>
                        Vence:{" "}
                        <strong>{state.infoAlumno.vencimiento || "-"}</strong>
                      </span>
                    </div>

                    <Boton
                      clase="aceptar"
                      texto="Registrar asistencia"
                      logo="Go"
                      disable={state.accion === "registro"}
                      onClick={handleRegistrar}
                    />
                  </div>
                )}

                <Feedback error={state.error} aviso={state.aviso} />
              </>
            )}

            {/* ---------------- PLANTILLA ---------------- */}
            {state.modo === "plantilla" && (
              <>
                <div className="asistencia_rapida_dos_columnas">
                  <div className="asistencia_rapida_campo">
                    <span className="asistencia_rapida_label">Plantilla</span>
                    <SelectorOpt<TipadoAsistencia.PlantillaOpcion>
                      categorias={opcionesPlantilla}
                      itemKey="id"
                      itemLabel="etiqueta"
                      name="plantilla"
                      labelDefault="Seleccioná la plantilla"
                      value={
                        state.plantillaSeleccionada !== null
                          ? String(state.plantillaSeleccionada)
                          : ""
                      }
                      onChangeSelector={(e) =>
                        handleElegirPlantilla(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </div>

                  <SelectorClase
                    opciones={opcionesClase}
                    value={state.idHorario}
                    name="claseGrupo"
                    textoVacio="No hay clases hoy."
                    onChange={cambiarClase}
                  />
                </div>

                {state.plantillaSeleccionada !== null && (
                  <>
                    <div className="asistencia_rapida_tabla_wrapper">
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
                                  checked={Boolean(
                                    state.seleccionados[fila.dni],
                                  )}
                                  disabled={fila.bloqueado}
                                  aria-label={`Registrar al alumno ${fila.dni}`}
                                  onChange={(e) =>
                                    handleToggleAlumno(
                                      fila.dni,
                                      e.target.checked,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <span className="asistencia_rapida_celda_nombre">
                                  {fila.datos?.nombre_completo ??
                                    `DNI ${fila.dni}`}
                                </span>
                                <span className="asistencia_rapida_celda_dni">
                                  DNI {fila.dni}
                                </span>
                              </td>
                              <td>
                                {fila.datos ? fila.datos.clases_restantes : "-"}
                              </td>
                              <td>{fila.datos?.vencimiento || "-"}</td>
                              <td>
                                <PildoraSituacion
                                  situacion={fila.situacion}
                                  texto={fila.datos ? undefined : "Sin datos"}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="asistencia_rapida_acciones">
                      <span className="asistencia_rapida_contador">
                        {cantidadMarcados} alumno{plural(cantidadMarcados)}{" "}
                        marcado
                        {plural(cantidadMarcados)}
                      </span>
                      <Boton
                        clase="aceptar"
                        texto="Registrar grupo"
                        logo="Go"
                        disable={
                          state.accion === "registroGrupo" ||
                          cantidadMarcados === 0
                        }
                        onClick={handleRegistrarGrupo}
                      />
                    </div>
                  </>
                )}

                <Feedback error={state.error} aviso={state.aviso} />
              </>
            )}
          </div>
        )}

        {/* ============================================================
            PESTAÑA: GESTIÓN DE PLANTILLAS
            ============================================================ */}
        {state.tab === "plantillas" && (
          <div className="asistencia_rapida_seccion">
            {/* ---------- Crear plantilla nueva ---------- */}
            <div className="asistencia_rapida_bloque">
              <h3 className="asistencia_rapida_bloque_titulo">
                Nueva plantilla
              </h3>

              <div className="asistencia_rapida_dos_columnas">
                <Inputs
                  label="Nombre de la plantilla"
                  name="nombrePlantilla"
                  type="text"
                  placeholder="Ej: Grupo lunes"
                  value={state.nombrePlantilla}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_NOMBRE_PLANTILLA",
                      payload: e.target.value,
                    })
                  }
                  readonly={false}
                />
                <Inputs
                  label="Buscar alumno"
                  name="dniNuevo"
                  type="text"
                  placeholder="Nombre, apellido o DNI"
                  value={state.dniNuevo}
                  onChange={(e) => handleBusquedaNueva(e.target.value)}
                  readonly={false}
                />
              </div>

              <ResultadosBusqueda
                consulta={state.dniNuevo}
                buscando={state.buscando}
                resultados={state.resultadosBusqueda}
                onElegir={sumarPendienteDesdeBusqueda}
              />

              <div className="asistencia_rapida_acciones">
                <Boton
                  clase="agregar"
                  texto="Agregar alumno"
                  logo="Add"
                  onClick={handleSumarPendiente}
                />
                <span className="asistencia_rapida_contador">
                  {state.alumnosPendientes.length} alumno
                  {plural(state.alumnosPendientes.length)} en la lista
                </span>
              </div>

              {state.alumnosPendientes.length > 0 && (
                <ul className="asistencia_rapida_chips">
                  {state.alumnosPendientes.map((dniAlumno) => (
                    <li key={dniAlumno} className="asistencia_rapida_chip">
                      <span>
                        {state.infoAlumnos[dniAlumno]?.nombre_completo ??
                          `DNI ${dniAlumno}`}
                      </span>
                      <button
                        type="button"
                        aria-label={`Quitar DNI ${dniAlumno} de la lista`}
                        onClick={() => handleSacarPendiente(dniAlumno)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="asistencia_rapida_acciones">
                <Boton
                  clase="aceptar"
                  texto="Crear plantilla"
                  logo="Check"
                  disable={state.accion === "plantilla"}
                  onClick={handleCrearPlantilla}
                />
              </div>
            </div>

            {state.mensajePlantillas && (
              <CompoError mensaje={state.mensajePlantillas} />
            )}

            {/* ---------- Listado ---------- */}
            <div className="asistencia_rapida_lista">
              {state.plantillas.length === 0 ? (
                <p className="asistencia_rapida_leyenda">
                  Todavía no creaste ninguna plantilla.
                </p>
              ) : (
                state.plantillas.map((p) => {
                  const editando = state.plantillaEditando === p.id_plantilla;

                  return (
                    <div
                      key={p.id_plantilla}
                      className="asistencia_rapida_plantilla"
                    >
                      <div className="asistencia_rapida_plantilla_header">
                        <div>
                          <strong>{p.nombre}</strong>
                          <span className="asistencia_rapida_meta">
                            {p.alumnos.length} alumno{plural(p.alumnos.length)}
                          </span>
                        </div>

                        <div className="asistencia_rapida_acciones">
                          <Boton
                            clase="listar"
                            texto="Usar"
                            logo="Check"
                            size={16}
                            onClick={() => usarPlantilla(p.id_plantilla)}
                          />
                          <Boton
                            clase="flechas"
                            texto={editando ? "Cerrar" : "Alumnos"}
                            logo="Edit"
                            size={16}
                            onClick={() => alternarEdicion(p.id_plantilla)}
                          />
                          <Boton
                            clase="eliminar"
                            texto="Borrar"
                            logo="Delete"
                            size={16}
                            disable={state.accion === "plantilla"}
                            onClick={() =>
                              handleBorrarPlantilla(p.id_plantilla)
                            }
                          />
                        </div>
                      </div>

                      <ul className="asistencia_rapida_plantilla_alumnos">
                        {p.alumnos.map((dniAlumno) => {
                          const datos = state.infoAlumnos[dniAlumno];
                          return (
                            <li key={dniAlumno}>
                              <span>
                                {datos?.nombre_completo ?? `DNI ${dniAlumno}`}
                                {datos && (
                                  <span className="asistencia_rapida_meta">
                                    {datos.clases_restantes} clases · vence{" "}
                                    {datos.vencimiento || "-"}
                                  </span>
                                )}
                              </span>

                              {editando && (
                                <button
                                  type="button"
                                  className="asistencia_rapida_quitar"
                                  aria-label={`Quitar DNI ${dniAlumno} de la plantilla`}
                                  disabled={state.accion === "quitarAlumno"}
                                  onClick={() =>
                                    handleQuitarAlumno(
                                      p.id_plantilla,
                                      dniAlumno,
                                    )
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
                      {editando && (
                        <div className="asistencia_rapida_agregar_alumno">
                          <div className="asistencia_rapida_fila">
                            <div className="asistencia_rapida_campo_crece">
                              <Inputs
                                label="Buscar alumno a agregar"
                                name={`dniAgregar_${p.id_plantilla}`}
                                type="text"
                                placeholder="Nombre, apellido o DNI"
                                value={state.dniAgregar}
                                onChange={(e) =>
                                  handleBusquedaAgregar(e.target.value)
                                }
                                readonly={false}
                              />
                            </div>
                            <Boton
                              clase="agregar"
                              texto="Agregar al grupo"
                              logo="Add"
                              disable={state.accion === "agregarAlumno"}
                              onClick={() => agregarPorDni(p.id_plantilla)}
                            />
                          </div>

                          <ResultadosBusqueda
                            consulta={state.dniAgregar}
                            buscando={state.buscando}
                            resultados={state.resultadosBusqueda}
                            onElegir={(r) =>
                              agregarDesdeBusqueda(p.id_plantilla, r)
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
