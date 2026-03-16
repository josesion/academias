import { Buscadores } from "../../../componentes/Buscadores/Buscador";
import { FiltroFechas } from "../../../componentes/FiltrosFechas/FiltrosFechas";
import { ElementoLista } from "../../../componentes/ElementoListadoInscrip/ElementoListado";

import { setListadoInscripcion } from "../../../hookNegocios/listadoInscrip";

import "./listadoInscrip.css";

export const ListadoInscripcionPage = () => {
  const {
    inputsFiltro,
    estado,
    filtroData,
    handleChangaValue,
    handleChangeEstado,
    handleChangeFechaDesde,
    handleChangeFechaHasta,
  } = setListadoInscripcion();

  const data = {
    id_inscripcion: 106,
    dni_alumno: 40345678,
    nombre_completo: "Lucía Martínez",
    nombre_plan: "Plan Anual Ilimitado",
    clases_usadas: 10,
    clases_totales: 12,
    fecha_inicio: "2026-03-06",
    vigencia: "2027-03-06",
    monto_pagado: "250000.00",
    metodo_pago: "transferencia",
  };

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

      <ElementoLista inscripcion={data} />
    </div>
  );
};
