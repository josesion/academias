import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";

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

  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

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
            <PanelDetalleInscripSoloLectura
              infoDetalle={dataInfoDetalle}
              estado={state.dataInfoDetalle.estado}
              onCerrar={handleCancelarAnulacion}
            />
          )}
        </div>
      )}

      {/* FILTROS: panel lateral que se esconde a la izquierda */}
      <div className={`contenedor_filtros ${filtrosAbiertos ? "abierto" : ""}`}>
        <button
          type="button"
          className="filtros_lengueta"
          onClick={() => setFiltrosAbiertos((prev) => !prev)}
          aria-expanded={filtrosAbiertos}
          aria-label={filtrosAbiertos ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Search size={16} />
          <span className="filtros_lengueta_texto">Filtro</span>
          <ChevronRight size={14} className="filtros_flecha" />
        </button>

        <div className="filtros_cuerpo">
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
