import { ListaCajaBase } from "../../../hooks/ListadoCajas/ListadoCajasBase";

//Componentes
import { EstadoCaja } from "../../../componentes/ListadoCajas/EstadoCaja/EstadoCaja";
import { DetalleCajas } from "../../../componentes/ListadoCajas/Listado/DetalleCaja";
import { LibroDiarioGeneral } from "../../../componentes/ListadoCajas/LibroDiario/LibroDiario";
import { GraficoMetodosPago } from "../../../componentes/ListadoCajas/Graficosmetodos/Graficos";

export const ListadoCajas = () => {
  const {
    mockLibroDiario,
    mockResumenMetodosPago,
    mockCajaActiva,
    mockHistorialCajasCerradas,
  } = ListaCajaBase();

  console.log(mockHistorialCajasCerradas);

  return (
    <div className="listado_cajas_pagina">
      <EstadoCaja
        id_caja={mockCajaActiva.id_caja}
        usuario={mockCajaActiva.cajero}
        fecha_apertura={mockCajaActiva.fecha_apertura}
        hora_apertura={mockCajaActiva.hora_apertura}
        estado={mockCajaActiva.estado as "abierta" | "cerrada"}
        total={mockCajaActiva.total}
        totales={mockCajaActiva.totales}
      />

      <GraficoMetodosPago props={mockResumenMetodosPago} />

      <LibroDiarioGeneral movimientos={mockLibroDiario} />

      <div className="listado_cajas_panel">
        <DetalleCajas props={mockHistorialCajasCerradas} />
      </div>
    </div>
  );
};
