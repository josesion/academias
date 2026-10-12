import { useState, useEffect, useRef } from "react";
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
  const filtroPanelRef = useRef<HTMLDivElement>(null);
  const lengüetaRef = useRef<HTMLButtonElement>(null);

  // Focus management: al abrir panel → focus en primer elemento focusable; al cerrar → focus en lengüeta
  useEffect(() => {
    if (filtrosAbiertos && filtroPanelRef.current) {
      const timeout = setTimeout(() => {
        const focusable = filtroPanelRef.current?.querySelector<HTMLElement>(
          'input, select, button, [tabindex]:not([tabindex="-1"])',
        );
        focusable?.focus();
      }, 350);
      return () => clearTimeout(timeout);
    } else {
      lengüetaRef.current?.focus();
    }
  }, [filtrosAbiertos]);

  return (
    // NO va `<main>` ni `role="main"`: el layout ya aporta el unico landmark
    // `main` de la pagina. Un segundo `main` anidado es invalido.
    <div className="contenedor_listado">
      <header className="gestion_inscripciones_header">
        <h1 className="gestion_inscripciones_titulo">
          Gestión de Inscripciones :
        </h1>
      </header>

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
      <div
        ref={filtroPanelRef}
        className={`contenedor_filtros ${filtrosAbiertos ? "abierto" : ""}`}
        role="search"
        aria-label="Filtros de inscripciones"
      >
        <button
          ref={lengüetaRef}
          type="button"
          className="filtros_lengueta"
          onClick={() => setFiltrosAbiertos((prev) => !prev)}
          aria-expanded={filtrosAbiertos}
          aria-label={filtrosAbiertos ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Search size={16} aria-hidden="true" />
          <span className="filtros_lengueta_texto">Filtro</span>
          <ChevronRight size={14} className="filtros_flecha" aria-hidden="true" />
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
        abrirInscribir={abrirInscribir}
      />

      <nav aria-label="Paginación de inscripciones" className="listado_inscrip_paginacion">
        <Paginacion
          paginaActual={state.barraPaginacion.pagina as number}
          contadorPagina={state.barraPaginacion.contadorPagina as number}
          onPaginaCambiada={handlePaginaCambiada}
        />
      </nav>
    </div>
  );
};