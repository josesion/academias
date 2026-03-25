import { Buscadores } from "../../../componentes/Buscadores/Buscador";
import { FiltroFechas } from "../../../componentes/FiltrosFechas/FiltrosFechas";
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
  } = setListadoInscripcion();

  return (
    <div className="contenedor_listado">
      <div className="contenedor_filtros">
        <Buscadores
          tituloBuscador="Filtro de Busqueda"
          intputBuscador={inputsFiltro}
          estados={estado}
          buscadorData={filtroData}
          captionBoton={"Inscribir"}
          onChange={handleChangaValue}
          onEstados={handleChangeEstado}
        />
        <FiltroFechas
          fechaDesde={filtroData.fecha_desde}
          fechaHasta={filtroData.fecha_hasta}
          onDesdeChange={handleChangeFechaDesde}
          onHastaChange={handleChangeFechaHasta}
        />
      </div>

      <ContenedorListadoInscripciones data={dataListado} carga={carga} />

      <Paginacion
        paginaActual={barraPaginacion.pagina as number}
        contadorPagina={barraPaginacion.contadorPagina as number}
        onPaginaCambiada={handlePaginaCambiada}
      />
    </div>
  );
};
