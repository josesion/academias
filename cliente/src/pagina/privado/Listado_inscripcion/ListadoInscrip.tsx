import { Buscadores } from "../../../componentes/Buscadores/Buscador";
import { FiltroFechas } from "../../../componentes/FiltrosFechas/FiltrosFechas";
import { ContenedorListadoInscripciones } from "../../../componentes/ContenedorListadoInscrp/ContendorListadoInscrip";
import { Paginacion } from "../../../componentes/Paginacion/Paginacion";
import { PanelDetalleInscrip } from "../../../componentes/PanelDetalleInsc/PanelDetalleInsc";

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

  return (
    <div className="contenedor_listado">
      {dataAnularInscripcion.modalAnular && (
        <div className="modal_overlay_fix">
          (
          <PanelDetalleInscrip
            infoDetalle={dataInfoDetalle}
            cancelarPanel={handleCancelarAnulacion}
            anularInscripcion={handleAnularInscripcion}
            listaMetodoPago={listadoCuentas}
            onChangeMetodo={handleCachearMetodoPago}
            errorAnulacion={errorAnulacion ?? errorAnulacion}
            carga={dataAnularInscripcion.carga}
          />
          )
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
