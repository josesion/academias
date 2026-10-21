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
}

/**
 * Modal de asistencia rápida manual (spec 043).
 *
 * Este componente es **sólo presentación**: el estado vive en
 * `asistenciaRapidaReducer` y toda la lógica en `useAsistenciaRapidaLogica`
 * (hook `asistenciaRapida`).
 */
export const AsistenciaRapida = ({ abierto, onCerrar }: Props) => {
  const { refDialog } = useModalAccesible({ abierto, onCerrar });

  const {
    state,
    dispatch,
    situacionDe,
    handleDniChange,
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
  } = useAsistenciaRapidaSet(abierto);

  const dniRef = useRef<HTMLInputElement>(null);

  if (!abierto) return null;

  /** Clase CSS de la píldora de situación. */
  const claseSituacion = (
    situacion: TipadoAsistencia.SituacionAlumno
  ): string => `situacion situacion_${situacion}`;

  /** Texto de la píldora de situación. */
  const textoSituacion = (
    situacion: TipadoAsistencia.SituacionAlumno
  ): string =>
    situacion === "vigente"
      ? "Vigente"
      : situacion === "por_vencer"
      ? "Por vencer"
      : situacion === "vencido"
      ? "Vencido"
      : situacion === "sin_clases"
      ? "Sin clases"
      : "Inactivo";

  /** Filas de la tabla de alumnos de la plantilla elegida. */
  const filasPlantilla = state.plantillas
    .find((p) => p.id_plantilla === state.plantillaSeleccionada)
    ?.alumnos.map((dniAlumno) => {
      const datos = state.infoAlumnos[dniAlumno] ?? null;
      const situacion: TipadoAsistencia.SituacionAlumno = datos
        ? situacionDe(datos)
        : "inactivo";
      const bloqueado =
        !datos ||
        situacion === "vencido" ||
        situacion === "sin_clases" ||
        situacion === "inactivo";
      return { dni: dniAlumno, datos, situacion, bloqueado };
    }) ?? [];

  /** Cantidad de alumnos marcados para el registro grupal. */
  const cantidadMarcados = filasPlantilla.filter(
    (f) => state.seleccionados[f.dni]
  ).length;

  /** Opciones del selector de clases. */
  const opcionesClase = state.opcionesClase;

  /** Opciones del selector de plantillas. */
  const opcionesPlantilla = state.plantillas.map((p) => ({
    id: p.id_plantilla,
    nombre: p.nombre,
    etiqueta: `${p.nombre} (${p.alumnos.length})`,
  }));

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
          <div className="asistencia-rapida-seccion">
            {/* Sub-modo: alumno suelto o plantilla */}
            <div className="asistencia-rapida-subpestanas">
              <button
                type="button"
                className={`asistencia_rapida_subpestana ${
                  state.modo === "alumno" ? "activa" : ""
                }`}
                onClick={() => dispatch({ type: "SET_MODO", payload: "alumno" })}
              >
                Alumno
              </button>
              <button
                type="button"
                className={`asistencia_rapida_subpestana ${
                  state.modo === "plantilla" ? "activa" : ""
                }`}
                onClick={() => dispatch({ type: "SET_MODO", payload: "plantilla" })}
              >
                Plantilla
              </button>
            </div>

            {/* ---------------- ALUMNO SUELTO ---------------- */}
            {state.modo === "alumno" && (
              <>
                <div className="asistencia-rapida-fila">
                  <div className="asistencia_rapida_campo_crece">
                    <Inputs
                      label="DNI del alumno"
                      name="dni"
                      type="number"
                      placeholder="Ej: 30023547"
                      value={state.dni}
                      onChange={(e) => handleDniChange(e.target.value)}
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
                    <SelectorOpt<TipadoAsistencia.ClaseOpcion>
                      categorias={opcionesClase}
                      itemKey="id"
                      itemLabel="nombre"
                      name="clase"
                      labelDefault="Seleccioná la clase"
                      value={state.idHorario !== null ? String(state.idHorario) : ""}
                      onChangeSelector={(e) =>
                        dispatch({
                          type: "SET_ID_HORARIO",
                          payload: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                )}

                {state.infoAlumno && (
                  <div className="asistencia-rapida-ficha">
                    <div className="asistencia_rapida_ficha_datos">
                      <span className="asistencia_rapida_ficha_nombre">
                        {state.infoAlumno.nombre_completo}
                      </span>
                      <span className="asistencia_rapida_ficha_plan">
                        {state.infoAlumno.plan}
                      </span>
                    </div>
                    <div className="asistencia_rapida_ficha_items">
                      <span className="asistencia_rapida_ficha_item">
                        <strong>{state.infoAlumno.clases_restantes}</strong>{" "}
                        clases restantes
                      </span>
                      <span className="asistencia_rapida_ficha_item">
                        Vence:{" "}
                        <strong>{state.infoAlumno.vencimiento || "-"}</strong>
                      </span>
                      <span className={claseSituacion(situacionDe(state.infoAlumno))}>
                        {textoSituacion(situacionDe(state.infoAlumno))}
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

                {state.error && <CompoError mensaje={state.error} />}
                {state.aviso && (
                  <p
                    className={`asistencia_rapida_aviso ${state.aviso.tipo}`}
                    role="status"
                    aria-live="polite"
                  >
                    {state.aviso.texto}
                  </p>
                )}
              </>
            )}

            {/* ---------------- PLANTILLA ---------------- */}
            {state.modo === "plantilla" && (
              <>
                <div className="asistencia-rapida-dos-columnas">
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
                      <SelectorOpt<TipadoAsistencia.ClaseOpcion>
                        categorias={opcionesClase}
                        itemKey="id"
                        itemLabel="nombre"
                        name="claseGrupo"
                        labelDefault="Seleccioná la clase"
                        value={
                          state.idHorario !== null ? String(state.idHorario) : ""
                        }
                        onChangeSelector={(e) =>
                          dispatch({
                            type: "SET_ID_HORARIO",
                            payload: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {state.plantillaSeleccionada !== null && (
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
                                checked={Boolean(state.seleccionados[fila.dni])}
                                disabled={fila.bloqueado}
                                aria-label={`Registrar al alumno ${fila.dni}`}
                                onChange={(e) =>
                                  handleToggleAlumno(fila.dni, e.target.checked)
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
                            <td>
                              {fila.datos ? fila.datos.clases_restantes : "-"}
                            </td>
                            <td>{fila.datos?.vencimiento || "-"}</td>
                            <td>
                              <span className={claseSituacion(fila.situacion)}>
                                {fila.datos
                                  ? textoSituacion(fila.situacion)
                                  : "Sin datos"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {state.plantillaSeleccionada !== null && (
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
                        state.accion === "registroGrupo" || cantidadMarcados === 0
                      }
                      onClick={handleRegistrarGrupo}
                    />
                  </div>
                )}

                {state.error && <CompoError mensaje={state.error} />}
                {state.aviso && (
                  <p
                    className={`asistencia_rapida_aviso ${state.aviso.tipo}`}
                    role="status"
                    aria-live="polite"
                  >
                    {state.aviso.texto}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ============================================================
            PESTAÑA: GESTIÓN DE PLANTILLAS
            ============================================================ */}
        {state.tab === "plantillas" && (
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
                  label="DNI del alumno"
                  name="dniNuevo"
                  type="number"
                  placeholder="Ej: 30023547"
                  value={state.dniNuevo}
                  onChange={(e) =>
                    dispatch({ type: "SET_DNI_NUEVO", payload: e.target.value })
                  }
                  readonly={false}
                />
              </div>

              <div className="asistencia-rapida-acciones">
                <Boton
                  clase="agregar"
                  texto="Agregar alumno"
                  logo="Add"
                  onClick={handleSumarPendiente}
                />
                <span className="asistencia_rapida_contador">
                  {state.alumnosPendientes.length} alumno
                  {state.alumnosPendientes.length === 1 ? "" : "s"} en la lista
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

              <div className="asistencia-rapida-acciones">
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
            <div className="asistencia-rapida-lista">
              {state.plantillas.length === 0 ? (
                <p className="asistencia-rapida-leyenda">
                  Todavía no creaste ninguna plantilla.
                </p>
              ) : (
                state.plantillas.map((p) => (
                  <div
                    key={p.id_plantilla}
                    className="asistencia-rapida-plantilla"
                  >
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
                            dispatch({ type: "SET_TAB", payload: "asistencia" });
                            dispatch({ type: "SET_MODO", payload: "plantilla" });
                            handleElegirPlantilla(p.id_plantilla);
                          }}
                        />
                        <Boton
                          clase="flechas"
                          texto={
                            state.plantillaEditando === p.id_plantilla
                              ? "Cerrar"
                              : "Alumnos"
                          }
                          logo="Edit"
                          size={16}
                          onClick={() =>
                            dispatch({
                              type: "SET_PLANTILLA_EDITANDO",
                              payload:
                                state.plantillaEditando === p.id_plantilla
                                  ? null
                                  : p.id_plantilla,
                            })
                          }
                        />
                        <Boton
                          clase="eliminar"
                          texto="Borrar"
                          logo="Delete"
                          size={16}
                          disable={state.accion === "plantilla"}
                          onClick={() => handleBorrarPlantilla(p.id_plantilla)}
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
                                <span className="celda_alumno_dni">
                                  {" "}
                                  · {datos.clases_restantes} clases · vence{" "}
                                  {datos.vencimiento || "-"}
                                </span>
                              )}
                            </span>
                            {state.plantillaEditando === p.id_plantilla && (
                              <button
                                type="button"
                                className="asistencia_rapida_quitar"
                                aria-label={`Quitar DNI ${dniAlumno} de la plantilla`}
                                disabled={state.accion === "quitarAlumno"}
                                onClick={() =>
                                  handleQuitarAlumno(p.id_plantilla, dniAlumno)
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
                    {state.plantillaEditando === p.id_plantilla && (
                      <div className="asistencia_rapida_agregar_alumno">
                        <Inputs
                          label="DNI del alumno a agregar"
                          name={`dniAgregar_${p.id_plantilla}`}
                          type="number"
                          placeholder="Ej: 30123456"
                          value={state.dniAgregar}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_DNI_AGREGAR",
                              payload: e.target.value,
                            })
                          }
                          readonly={false}
                        />
                        <Boton
                          clase="agregar"
                          texto="Agregar al grupo"
                          logo="Add"
                          disable={state.accion === "agregarAlumno"}
                          onClick={() => {
                            const valor = Number(state.dniAgregar.trim());
                            if (!Number.isFinite(valor) || valor <= 0) {
                              dispatch({
                                type: "SET_MENSAJE_PLANTILLAS",
                                payload: "El DNI no es válido.",
                              });
                              return;
                            }
                            void handleAgregarAlumno(p.id_plantilla, valor);
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
