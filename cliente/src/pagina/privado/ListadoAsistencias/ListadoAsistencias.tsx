import { setListadoAsistencias } from "../../../hookNegocios/listadoAsistencias";
import { formatearFechaCorta } from "../../../utils/fecha";

// Componentes
import { FiltroFechas } from "../../../componentes/generales/FiltrosFechas/FiltrosFechas";
import { SelectorOpt } from "../../../componentes/generales/CompSelecObt/SelectorOpt";
import { Paginacion } from "../../../componentes/generales/Paginacion/Paginacion";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { CompoError } from "../../../componentes/generales/Error/Error";
import { SinResultado } from "../../../componentes/generales/SinItemsListado/SinResultado";
import { ComponenteCargando } from "../../../componentes/generales/Cargando/Cargando";

import type {
  AsistenciaListadoItem,
  EstadoAsistenciaListado,
} from "../../../tipadosTs/asistenciaListado.typado";

import "./listadoAsistencias.css";

/**
 * Etiqueta legible de cada estado de asistencia.
 *
 * El backend guarda el estado en minúsculas y sin tildes
 * (`presente` / `ausente` / `justificado`); la tabla muestra el texto con
 * mayúscula inicial (D20: estado por texto, no sólo por color).
 */
const ETIQUETAS_ESTADO: Record<EstadoAsistenciaListado, string> = {
  presente: "Presente",
  ausente: "Ausente",
  justificado: "Justificado",
};

/**
 * Etiqueta en plural de cada estado, para el resumen del encabezado.
 */
const ETIQUETAS_ESTADO_PLURAL: Record<EstadoAsistenciaListado, string> = {
  presente: "Presentes",
  ausente: "Ausentes",
  justificado: "Justificados",
};

/** Orden en que se muestran los estados en el resumen. */
const ORDEN_ESTADOS: EstadoAsistenciaListado[] = [
  "presente",
  "ausente",
  "justificado",
];

/**
 * Etiqueta legible de cada día de la semana.
 *
 * La foto guarda el día sin tildes (`miercoles`), que es como lo espera el
 * `ENUM` de la base y el filtro del backend; para mostrar se usa esta tabla
 * con tildes y mayúscula inicial.
 */
const ETIQUETAS_DIA: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

/**
 * Convierte el día guardado en la asistencia a su etiqueta visible.
 *
 * @param {string | null} dia - Día sin tildes (`"miercoles"`), o `null` si la
 *   asistencia no tiene foto.
 * @returns {string} La etiqueta con tildes, o `"—"` cuando no hay día.
 */
const formatearDia = (dia: string | null): string => {
  if (!dia) return "—";
  return ETIQUETAS_DIA[dia] ?? dia;
};

/**
 * Agrupa las asistencias por fecha calendario **preservando el orden recibido**.
 *
 * El backend ya ordena por `fecha DESC, hora_inicio DESC, apellido, nombre, id`,
 * así que las filas del mismo día llegan contiguas: no hace falta un `Map`
 * (que reordenaría) ni volver a ordenar en el cliente. Se recorre con un
 * acumulador igual que `agruparPorDia` de
 * `src/componentes/Historial/Historial.metricas.tsx`.
 *
 * @param {AsistenciaListadoItem[]} filas - Filas de la página actual, en el
 *   orden que devolvió el backend.
 * @returns {{ fecha : string; filas : AsistenciaListadoItem[] }[]} Un bloque
 *   por fecha, en el mismo orden de aparición.
 */
const agruparPorFecha = (
  filas: AsistenciaListadoItem[],
): { fecha: string; filas: AsistenciaListadoItem[] }[] => {
  const grupos: { fecha: string; filas: AsistenciaListadoItem[] }[] = [];

  filas.forEach((fila) => {
    const ultimoGrupo = grupos[grupos.length - 1];

    if (ultimoGrupo && ultimoGrupo.fecha === fila.fecha) {
      ultimoGrupo.filas.push(fila);
    } else {
      grupos.push({ fecha: fila.fecha, filas: [fila] });
    }
  });

  return grupos;
};

/**
 * Arma la etiqueta del encabezado de un grupo de día.
 *
 * @param {AsistenciaListadoItem} fila - Primera fila del grupo (cualquiera del
 *   grupo sirve: todas comparten fecha y día).
 * @returns {string} `"Viernes 23/10/2026"` o, si la asistencia no tiene foto y
 *   `dia_semana` es `null`, sólo `"23/10/2026"` (sin guion ni "null").
 */
const formatearEtiquetaDia = (fila: AsistenciaListadoItem): string => {
  const fecha = formatearFechaCorta(fila.fecha);

  if (!fila.dia_semana) return fecha;

  return `${formatearDia(fila.dia_semana)} ${fecha}`;
};

/**
 * Obtiene las iniciales para el avatar del alumno.
 *
 * @param {string} nombre - Nombre completo tal como viene del backend.
 * @returns {string} Hasta dos letras en mayúscula (`"?"` si el nombre viene vacío).
 */
const obtenerIniciales = (nombre: string): string => {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "?";

  return ((partes[0][0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
};

/**
 * Cuenta cuántas asistencias de la página hay de cada estado.
 *
 * @param {AsistenciaListadoItem[]} filas - Filas de la página actual.
 * @returns {Record<EstadoAsistenciaListado, number>} Un contador por estado.
 */
const contarPorEstado = (
  filas: AsistenciaListadoItem[],
): Record<EstadoAsistenciaListado, number> => {
  const conteo: Record<EstadoAsistenciaListado, number> = {
    presente: 0,
    ausente: 0,
    justificado: 0,
  };

  filas.forEach((fila) => {
    conteo[fila.estado] += 1;
  });

  return conteo;
};

/**
 * Página "Listado de Asistencias" (spec 048).
 *
 * Sólo JSX: el estado y las peticiones viven en
 * `hookNegocios/listadoAsistencias.ts` → `hooks/Asistencias/listadoAsistencias.ts`
 * → `reducers/listadoAsistenciasReducer.ts`.
 *
 * @returns El listado con sus filtros, estados y paginación.
 */
export const ListadoAsistenciasPage = () => {
  const {
    state,
    opcionesDia,
    opcionesHora,
    handleChangeFiltro,
    handleChangeDesde,
    handleChangeHasta,
    handlePaginaCambiada,
    handleLimpiarFiltros,
  } = setListadoAsistencias();

  const {
    listado,
    filtroData,
    carga,
    errorGenerico,
    barraPaginacion,
    catalogos,
  } = state;

  // Las filas del mismo día ya llegan contiguas (orden del backend).
  const grupos = agruparPorFecha(listado);

  return (
    <section
      className="listado_asistencias_pagina"
      aria-labelledby="titulo_listado_asistencias"
    >
      <header className="listado_asistencias_header">
        <div className="listado_asistencias_header_texto">
          <h1
            id="titulo_listado_asistencias"
            className="listado_asistencias_titulo"
          >
            Historial de Asistencias
          </h1>
          <p className="listado_asistencias_subtitulo">
            Asistencias registradas en la escuela para el período elegido.
          </p>
        </div>
      </header>

      <form
        className="listado_asistencias_filtros"
        role="search"
        aria-label="Filtros del listado de asistencias"
        onSubmit={(evento) => evento.preventDefault()}
      >
        <div className="listado_asistencias_filtros_cabecera">
          <h2 className="listado_asistencias_filtros_titulo">Filtros</h2>

          <Boton
            clase="listar"
            logo="Cancel"
            texto="Limpiar filtros"
            type="button"
            onClick={handleLimpiarFiltros}
          />
        </div>

        <div className="listado_asistencias_fechas">
          <FiltroFechas
            fechaDesde={filtroData.desde}
            fechaHasta={filtroData.hasta}
            onDesdeChange={handleChangeDesde}
            onHastaChange={handleChangeHasta}
            impedirVacio
          />
        </div>

        <div className="listado_asistencias_filtros_grid">
          <div className="listado_asistencias_campo">
            <label className="listado_asistencias_label" htmlFor="dia_semana">
              Día
            </label>
            <SelectorOpt
              categorias={opcionesDia}
              itemKey="valor"
              itemLabel="etiqueta"
              name="dia_semana"
              value={filtroData.dia_semana}
              labelDefault="Todos los días"
              onChangeSelector={handleChangeFiltro}
            />
          </div>

          <div className="listado_asistencias_campo">
            <label className="listado_asistencias_label" htmlFor="hora">
              Hora
            </label>
            <SelectorOpt
              categorias={opcionesHora}
              itemKey="valor"
              itemLabel="etiqueta"
              name="hora"
              value={filtroData.hora}
              labelDefault="Todas las horas"
              onChangeSelector={handleChangeFiltro}
            />
          </div>

          <div className="listado_asistencias_campo">
            <label className="listado_asistencias_label" htmlFor="dni_profesor">
              Profesor
            </label>
            <SelectorOpt
              categorias={catalogos.profesores}
              itemKey="Dni"
              itemLabel="Apellido"
              name="dni_profesor"
              value={filtroData.dni_profesor}
              labelDefault="Todos los profesores"
              onChangeSelector={handleChangeFiltro}
            />
          </div>

          <div className="listado_asistencias_campo">
            <label className="listado_asistencias_label" htmlFor="id_nivel">
              Nivel
            </label>
            <SelectorOpt
              categorias={catalogos.niveles}
              itemKey="id"
              itemLabel="nivel"
              name="id_nivel"
              value={filtroData.id_nivel}
              labelDefault="Todos los niveles"
              onChangeSelector={handleChangeFiltro}
            />
          </div>

          <div className="listado_asistencias_campo">
            <label
              className="listado_asistencias_label"
              htmlFor="id_tipo_clase"
            >
              Tipo de clase
            </label>
            <SelectorOpt
              categorias={catalogos.tipos}
              itemKey="id"
              itemLabel="tipo"
              name="id_tipo_clase"
              value={filtroData.id_tipo_clase}
              labelDefault="Todos los tipos"
              onChangeSelector={handleChangeFiltro}
            />
          </div>
        </div>
      </form>

      <div className="listado_asistencias_tabla_wrapper">
        {carga ? (
          <ComponenteCargando local />
        ) : errorGenerico ? (
          <CompoError mensaje={errorGenerico} />
        ) : listado.length === 0 ? (
          <SinResultado
            mensaje="No hay asistencias"
            submensaje="Probá con otro rango de fechas o quitá algún filtro."
          />
        ) : (
          <table className="listado_asistencias_tabla">
            <caption className="listado_asistencias_caption">
              Asistencias de esta página: {listado.length}
            </caption>

            <thead>
              <tr>
                <th scope="col">Hora</th>
                <th scope="col">Alumno</th>
                <th scope="col">Profesor</th>
                <th scope="col">Nivel</th>
                <th scope="col">Tipo</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>

            {/* Un <tbody> por fecha: el encabezado de día usa
                            `rowgroup`, así etiqueta las FILAS de ese <tbody>
                            (Chromium lo expone como rowheader, no como
                            columnheader). */}
            {grupos.map((grupo) => (
              <tbody key={grupo.fecha}>
                <tr className="listado_asistencias_grupo">
                  <th
                    scope="rowgroup"
                    colSpan={6}
                    className="listado_asistencias_grupo_dia"
                  >
                    <span className="listado_asistencias_grupo_contenido">
                      <span className="listado_asistencias_grupo_etiqueta">
                        {formatearEtiquetaDia(grupo.filas[0])}
                      </span>
                      <span className="listado_asistencias_grupo_cantidad">
                        {grupo.filas.length}{" "}
                        {grupo.filas.length === 1
                          ? "asistencia"
                          : "asistencias"}
                      </span>
                    </span>
                  </th>
                </tr>

                {grupo.filas.map((asistencia) => (
                  <tr
                    key={asistencia.id_asistencia}
                    className="listado_asistencias_fila"
                  >
                    <td data-label="Hora">
                      <span className="listado_asistencias_hora">
                        {asistencia.hora_inicio ?? "—"}
                      </span>
                    </td>

                    <td data-label="Alumno">
                      <span className="listado_asistencias_alumno_celda">
                        <span
                          className="listado_asistencias_avatar"
                          aria-hidden="true"
                        >
                          {obtenerIniciales(asistencia.alumno)}
                        </span>

                        <span className="listado_asistencias_alumno_datos">
                          <span className="listado_asistencias_alumno">
                            {asistencia.alumno}
                          </span>
                          <span className="listado_asistencias_alumno_dni">
                            DNI {asistencia.dni_alumno}
                          </span>
                        </span>
                      </span>
                    </td>

                    <td data-label="Profesor">{asistencia.profesor}</td>

                    <td data-label="Nivel">{asistencia.nivel}</td>

                    <td data-label="Tipo">{asistencia.tipo_clase}</td>

                    <td data-label="Estado">
                      <span
                        className={`listado_asistencias_estado ${asistencia.estado}`}
                      >
                        {ETIQUETAS_ESTADO[asistencia.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        )}
      </div>

      {/* Se muestra también con una sola página: las flechas quedan
                deshabilitadas, pero la barra es visible. Sólo se oculta cuando
                no hay páginas (lista vacía, error o carga inicial). */}
      {(barraPaginacion.contadorPagina ?? 0) >= 1 && (
        <Paginacion
          contadorPagina={barraPaginacion.contadorPagina ?? 0}
          paginaActual={barraPaginacion.pagina ?? 1}
          onPaginaCambiada={handlePaginaCambiada}
          ariaLabel="Paginación del listado de asistencias"
        />
      )}
    </section>
  );
};
