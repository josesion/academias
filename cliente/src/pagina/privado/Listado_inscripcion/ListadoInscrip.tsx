import { Buscadores } from "../../../componentes/Buscadores/Buscador";
import { FiltroFechas } from "../../../componentes/FiltrosFechas/FiltrosFechas";
import { EliminarVentana } from "../../../componentes/EliminarModal/EliminarModal";
import { ContenedorListadoInscripciones } from "../../../componentes/ContenedorListadoInscrp/ContendorListadoInscrip";
import { Paginacion } from "../../../componentes/Paginacion/Paginacion";

import { setListadoInscripcion } from "../../../hookNegocios/listadoInscrip";

import "./listadoInscrip.css";

export const ListadoInscripcionPage = () => {
  const {
    carga,
    inputsFiltro,
    estado,
    filtroData,
    handleChangaValue,
    handleChangeEstado,
    handleChangeFechaDesde,
    handleChangeFechaHasta,
    handlePaginaCambiada,
    barraPaginacion,
    dataListado,
    abrirInscribir,

    dataAnularInscripcion,
    manejarSeleccionInscripcion,
    handleCancelarAnulacion,
    handleAnularInscripcion,
  } = setListadoInscripcion();

  const { idInscripcion } = dataAnularInscripcion;

  return (
    <div className="contenedor_listado">
      {dataAnularInscripcion.modalAnular && (
        <div className="modal_overlay_fix">
          (
          <EliminarVentana
            onSi={handleAnularInscripcion}
            onCancelar={handleCancelarAnulacion}
            cargando={dataAnularInscripcion.carga}
            key={dataAnularInscripcion.idInscripcion}
            accion={dataAnularInscripcion.texto}
            data={{ idInscripcion }}
            mensaje={dataAnularInscripcion.mensajeError}
          />
          )
        </div>
      )}

      <div className="contenedor_filtros">
        <Buscadores
          tituloBuscador="Filtro de Busqueda"
          intputBuscador={inputsFiltro}
          estados={estado}
          buscadorData={filtroData}
          captionBoton={"Inscribir"}
          onChange={handleChangaValue}
          onEstados={handleChangeEstado}
          onAgregar={abrirInscribir}
        />
        <FiltroFechas
          fechaDesde={filtroData.fecha_desde}
          fechaHasta={filtroData.fecha_hasta}
          onDesdeChange={handleChangeFechaDesde}
          onHastaChange={handleChangeFechaHasta}
        />
      </div>

      <ContenedorListadoInscripciones
        data={dataListado}
        carga={carga}
        onSeleccionarInscripcion={manejarSeleccionInscripcion}
      />

      <Paginacion
        paginaActual={barraPaginacion.pagina as number}
        contadorPagina={barraPaginacion.contadorPagina as number}
        onPaginaCambiada={handlePaginaCambiada}
      />
    </div>
  );
};
