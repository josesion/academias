import { TarjetasNormales } from "../../../../componentes/TarjetasNormales/TarjetaNormali";
import {
  MovientoCaja,
  type Movimiento,
} from "../../../../componentes/MovimientoCaja/MovientoCaja";
import { PanelMetodoPAgo } from "../../../../componentes/MetodoPago/PanelMetodoPago";
import { Boton } from "../../../../componentes/Boton/Boton";

import { FcStatistics } from "react-icons/fc";
import "./caja.css";

const misMovimientos: Movimiento[] = [
  {
    id: 1,
    hora: "14:30",
    detalle: "Inscripción Alumno",
    metodo: "Efectivo",
    monto: 15500,
    tipo: "ingreso",
  },
  {
    id: 2,
    hora: "15:00",
    detalle: "Pago de Luz",
    metodo: "Transferencia",
    monto: 8000,
    tipo: "egreso",
  },
];

export const CajaArqueo = () => {
  return (
    <div className="caja_arqueo_contenedor">
      <div className="caja_arqueo_cabecera">
        <p className="caja_arqueo_titulo">
          Gestion de Caja <FcStatistics />
        </p>
        <div className="caja_arqueo_cabecera_botones">
          <Boton clase="aceptar" logo="Edit" texto="Abrir Caja" />
          <Boton clase="agregar" texto=" + Ingreso / Extras" />
          <Boton clase="eliminar" texto=" - Egresos / Gastos" />
        </div>
      </div>

      <div className="caja_arqueo_info_contenedor">
        <TarjetasNormales
          titulo="Monto Inicial"
          monto={15000}
          claseColor="azul"
        />
        <TarjetasNormales titulo="Ingresos" monto={85000} claseColor="verde" />
        <TarjetasNormales titulo="Egresos" monto={12000} claseColor="rojo" />
        <TarjetasNormales
          titulo="Efectivo en Mano"
          monto={88000}
          claseColor="negro"
        />
      </div>

      <div className="caja_arqueo_metricas">
        <div className="caja_arqueo_metricas_detalles">
          <p>Movimientos del Dia</p>
          <MovientoCaja movimientos={misMovimientos} />
        </div>
        <div className="caja_arqueo_metricas_metodo_pago">
          <p>Resumens Metodo Pago</p>
          <PanelMetodoPAgo
            totales={{
              efectivo: 80000,
              transferencia: 80000,
              credito: 15600,
              debito: 10000,
            }}
          />
        </div>
      </div>
    </div>
  );
};
