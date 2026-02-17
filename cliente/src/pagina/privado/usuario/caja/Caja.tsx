import { TarjetasNormales } from "../../../../componentes/TarjetasNormales/TarjetaNormali";
import {
  MovientoCaja,
  type Movimiento,
} from "../../../../componentes/MovimientoCaja/MovientoCaja";
import { PanelMetodoPAgo } from "../../../../componentes/MetodoPago/PanelMetodoPago";
import { Boton } from "../../../../componentes/Boton/Boton";
import { AperturaCaja } from "../../../../componentes/AperturaCaja/AperturaCaja";
import { CompoVerificacion } from "../../../../componentes/CompoVerificacion/CompoVerificacion";

// logica -----
import { cajasCongif } from "../../../../hookNegocios/caja.usuario";

// estilos -----
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
  const {
    modalApertura,
    modalCierre,
    montoInicial,
    totalIngresos,
    totalEgresos,
    flujoDelDia,
    totalEfectivo,
    totalTransferencia,
    totalDebito,
    totalCredito,
    enviando,
    estadoCaja,
    errorGenerico,
    cachearMontoInicial,
    apertura,
    handleCerrarCaja,
    handleCerrarModalCerrar,
    handleEstadosCaja,
    handleAbrirCajaModalCerrar,
    handleAbrirCaja,
  } = cajasCongif();

  return (
    <div className="caja_arqueo_contenedor">
      {modalApertura && (
        <div className="formulario_overlay">
          <AperturaCaja
            onCancelar={handleAbrirCajaModalCerrar}
            onChangeMontoInicial={cachearMontoInicial}
            onAbrirCaja={handleAbrirCaja}
            monto_inicial={apertura.monto_inicial}
            enviado={enviando}
            errorGenerico={errorGenerico}
          />
        </div>
      )}

      {modalCierre && (
        <div className="formulario_overlay">
          <CompoVerificacion
            texto="cerrar caja"
            onConfirmar={handleCerrarCaja}
            onCancelar={handleCerrarModalCerrar}
            enviando={enviando}
          />
        </div>
      )}

      <div className="caja_arqueo_cabecera">
        <p className="caja_arqueo_titulo">
          Gestion de Caja <FcStatistics />
          <p>({estadoCaja === "abierta" ? "Abierta" : "Cerrada"})</p>
        </p>

        <div className="caja_arqueo_cabecera_botones">
          <Boton
            clase={estadoCaja === "abierta" ? "cancelar" : "agregar"}
            logo={estadoCaja === "abierta" ? "Cancel" : "Edit"}
            texto={estadoCaja === "abierta" ? "Cerrar Caja" : "Abrir Caja"}
            onClick={handleEstadosCaja}
          />
          <Boton clase="agregar" texto=" + Ingreso / Extras" />
          <Boton clase="eliminar" texto=" - Egresos / Gastos" />
        </div>
      </div>

      <div className="caja_arqueo_info_contenedor">
        <TarjetasNormales
          titulo="Monto Inicial"
          monto={montoInicial}
          claseColor="azul"
        />
        <TarjetasNormales
          titulo="Ingresos"
          monto={totalIngresos}
          claseColor="verde"
        />
        <TarjetasNormales
          titulo="Egresos"
          monto={totalEgresos}
          claseColor="rojo"
        />
        <TarjetasNormales
          titulo="Flujo del Dia"
          monto={flujoDelDia}
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
              efectivo: totalEfectivo,
              transferencia: totalTransferencia,
              credito: totalCredito,
              debito: totalDebito,
            }}
          />
        </div>
      </div>
    </div>
  );
};
