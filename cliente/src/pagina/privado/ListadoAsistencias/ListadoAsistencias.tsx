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

import type { EstadoAsistenciaListado } from "../../../tipadosTs/asistenciaListado.typado";

import "./listadoAsistencias.css";

/**
 * Etiqueta legible de cada estado de asistencia.
 *
 * El backend guarda el estado en minúsculas y sin tildes
 * (`presente` / `ausente` / `justificado`); la tabla muestra el texto con
 * mayúscula inicial (D20: estado por texto, no sólo por color).
 */
const ETIQUETAS_ESTADO : Record<EstadoAsistenciaListado, string> = {
    presente    : "Presente",
    ausente     : "Ausente",
    justificado : "Justificado"
};

/**
 * Etiqueta legible de cada día de la semana.
 *
 * La foto guarda el día sin tildes (`miercoles`), que es como lo espera el
 * `ENUM` de la base y el filtro del backend; para mostrar se usa esta tabla
 * con tildes y mayúscula inicial.
 */
const ETIQUETAS_DIA : Record<string, string> = {
    lunes     : "Lunes",
    martes    : "Martes",
    miercoles : "Miércoles",
    jueves    : "Jueves",
    viernes   : "Viernes",
    sabado    : "Sábado",
    domingo   : "Domingo"
};

/**
 * Convierte el día guardado en la asistencia a su etiqueta visible.
 *
 * @param {string | null} dia - Día sin tildes (`"miercoles"`), o `null` si la
 *   asistencia no tiene foto.
 * @returns {string} La etiqueta con tildes, o `"—"` cuando no hay día.
 */
const formatearDia = ( dia : string | null ) : string => {
    if ( !dia ) return "—";
    return ETIQUETAS_DIA[ dia ] ?? dia;
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
        handleLimpiarFiltros
    } = setListadoAsistencias();

    const {
        listado,
        filtroData,
        carga,
        errorGenerico,
        barraPaginacion,
        catalogos
    } = state;

    return (
        <section
            className="listado_asistencias_pagina"
            aria-labelledby="titulo_listado_asistencias"
        >

            <header className="listado_asistencias_header">
                <h1
                    id="titulo_listado_asistencias"
                    className="listado_asistencias_titulo"
                >
                    Listado de Asistencias
                </h1>
                <p className="listado_asistencias_subtitulo">
                    Asistencias registradas en la escuela para el período elegido.
                </p>
            </header>

            <form
                className="listado_asistencias_filtros"
                role="search"
                aria-label="Filtros del listado de asistencias"
                onSubmit={( evento ) => evento.preventDefault()}
            >

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
                        <label
                            className="listado_asistencias_label"
                            htmlFor="dia_semana"
                        >
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
                        <label
                            className="listado_asistencias_label"
                            htmlFor="hora"
                        >
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
                        <label
                            className="listado_asistencias_label"
                            htmlFor="dni_profesor"
                        >
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
                        <label
                            className="listado_asistencias_label"
                            htmlFor="id_nivel"
                        >
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

                <div className="listado_asistencias_acciones">
                    <Boton
                        clase="listar"
                        logo="Cancel"
                        texto="Limpiar filtros"
                        type="button"
                        onClick={handleLimpiarFiltros}
                    />
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
                                <th scope="col">Fecha</th>
                                <th scope="col">Hora</th>
                                <th scope="col">Día</th>
                                <th scope="col">Alumno</th>
                                <th scope="col">Profesor</th>
                                <th scope="col">Nivel</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {listado.map(( asistencia ) => (
                                <tr
                                    key={asistencia.id_asistencia}
                                    className="listado_asistencias_fila"
                                >
                                    <td data-label="Fecha">
                                        {formatearFechaCorta( asistencia.fecha )}
                                    </td>

                                    <td data-label="Hora">
                                        {asistencia.hora_inicio ?? "—"}
                                    </td>

                                    <td data-label="Día">
                                        {formatearDia( asistencia.dia_semana )}
                                    </td>

                                    <td data-label="Alumno">
                                        <span className="listado_asistencias_alumno_datos">
                                            <span className="listado_asistencias_alumno">
                                                {asistencia.alumno}
                                            </span>
                                            <span className="listado_asistencias_alumno_dni">
                                                DNI {asistencia.dni_alumno}
                                            </span>
                                        </span>
                                    </td>

                                    <td data-label="Profesor">
                                        {asistencia.profesor}
                                    </td>

                                    <td data-label="Nivel">
                                        {asistencia.nivel}
                                    </td>

                                    <td data-label="Tipo">
                                        {asistencia.tipo_clase}
                                    </td>

                                    <td data-label="Estado">
                                        <span
                                            className={`listado_asistencias_estado ${asistencia.estado}`}
                                        >
                                            {ETIQUETAS_ESTADO[ asistencia.estado ]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

            {(barraPaginacion.contadorPagina ?? 0) > 1 && (
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
