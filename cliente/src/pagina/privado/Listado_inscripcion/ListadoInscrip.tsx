import { Buscadores } from "../../../componentes/Buscadores/Buscador";
import { FiltroFechas } from "../../../componentes/FiltrosFechas/FiltrosFechas";
import { EliminarVentana } from "../../../componentes/EliminarModal/EliminarModal";
import { ContenedorListadoInscripciones } from "../../../componentes/ContenedorListadoInscrp/ContendorListadoInscrip";
import { Paginacion } from "../../../componentes/Paginacion/Paginacion";
import { PanelDetalleInscrip } from "../../../componentes/PanelDetalleInsc/PanelDetalleInsc";

import { setListadoInscripcion } from "../../../hookNegocios/listadoInscrip";

import "./listadoInscrip.css";

export const ListadoInscripcionPage = () => {
  const {
    //carga,
    inputsFiltro,
    estado,
    // filtroData,
    handleChangaValue,
    handleChangeEstado,
    handleChangeFechaDesde,
    handleChangeFechaHasta,
    handlePaginaCambiada,
    // barraPaginacion,
    // dataListado,
    abrirInscribir,

    dataAnularInscripcion,
    manejarSeleccionInscripcion,
    handleCancelarAnulacion,
    handleAnularInscripcion,
    state,
  } = setListadoInscripcion();

  const data = {
    nombre_completo: "jose manuel",
    dni_alumno: 33762577,
    clases_totales: 20,
    clases_tomadas: 3,
    vigencia: "2026/08/13",
    monto_pagado: 5000,
    metodo_pago_descrip: "Naranjax",
  };

  const { idInscripcion } = dataAnularInscripcion;

  return (
    <div className="contenedor_listado">
      {dataAnularInscripcion.modalAnular && (
        <div className="modal_overlay_fix">
          (
          <PanelDetalleInscrip infoDetalle={data} />)
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
