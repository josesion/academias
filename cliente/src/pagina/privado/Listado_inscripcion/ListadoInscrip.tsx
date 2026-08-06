import { Buscadores } from "../../../componentes/generales/Buscadores/Buscador";
import { FiltroFechas } from "../../../componentes/generales/FiltrosFechas/FiltrosFechas";
import { ContenedorListadoInscripciones } from "../../../componentes/Inscripciones/ContenedorListadoInscrp/ContendorListadoInscrip";
import { Paginacion } from "../../../componentes/generales/Paginacion/Paginacion";
import { PanelDetalleInscrip } from "../../../componentes/Inscripciones/PanelDetalleInsc/PanelDetalleInsc";
import { PanelDetalleInscripSoloLectura } from "../../../componentes/Inscripciones/InformeSoloLectura/InfoSoloLectura";

import { setListadoInscripcion } from "../../../hookNegocios/listadoInscrip";

import "./listadoInscrip.css";

export const ListadoInscripcionPage = () => {
  const {
    inputsFiltro,
    estado,
    handleChangaValue,
    handleChangeEstado,
    handleChangeFechaDesde,
    handleChangeFechaHasta,
    handlePaginaCambiada,
    abrirInscribir,
    manejarSeleccionInscripcion,
    handleCancelarAnulacion,
    handleCachearMetodoPago,
    handleAnularInscripcion,
    state,
  } = setListadoInscripcion();

  const {
    dataAnularInscripcion,
    dataInfoDetalle,
    listadoCuentas,
    errorAnulacion,
  } = state;

  console.log(state.dataInfoDetalle);

  return (
    <div className="contenedor_listado">
      {dataAnularInscripcion.modalAnular && (
        <div className="modal_overlay_fix">
          {state.dataInfoDetalle.estado === "activos" ? (
            <PanelDetalleInscrip
              infoDetalle={dataInfoDetalle}
              cancelarPanel={handleCancelarAnulacion}
              anularInscripcion={handleAnularInscripcion}
              listaMetodoPago={listadoCuentas}
              onChangeMetodo={handleCachearMetodoPago}
              errorAnulacion={errorAnulacion ?? errorAnulacion}
              carga={dataAnularInscripcion.carga}
            />
          ) : (
            <div
              style={{ color: "white", textAlign: "center", padding: "20px" }}
            >
              <PanelDetalleInscripSoloLectura
                infoDetalle={dataInfoDetalle}
                estado={state.dataInfoDetalle.estado}
                onCerrar={handleCancelarAnulacion}
              />
            </div>
          )}
        </div>
      )}

      <div className="contenedor_filtros">
        <Buscadores
          tituloBuscador="Filtro de Busqueda"
          intputBuscador={inputsFiltro}
          estados={estado}
          buscadorData={state.filtroData}
          captionBoton={"Inscribir"}
          onChange={handleChangaValue}
          onEstados={handleChangeEstado}
          onAgregar={abrirInscribir}
        />
        <FiltroFechas
          fechaDesde={state.filtroData.fecha_desde}
          fechaHasta={state.filtroData.fecha_hasta}
          onDesdeChange={handleChangeFechaDesde}
          onHastaChange={handleChangeFechaHasta}
        />
      </div>

      <ContenedorListadoInscripciones
        data={state.listadoInscripcion}
        carga={state.carga}
        onSeleccionarInscripcion={manejarSeleccionInscripcion}
      />

      <Paginacion
        paginaActual={state.barraPaginacion.pagina as number}
        contadorPagina={state.barraPaginacion.contadorPagina as number}
        onPaginaCambiada={handlePaginaCambiada}
      />
    </div>
  );
};
