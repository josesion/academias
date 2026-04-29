import "./panelmovimientopago.css";
import CountUp from "react-countup";

export interface MetricasCuentaSesion {
  id_cuenta: number | string;
  nombre_cuenta: string;
  inicial_cuenta: number;
  movimiento_sesion: number;
  saldo_final_cuenta: number;
}

interface PanelMetodoPagoProps {
  cuentas: MetricasCuentaSesion[] | null;
}

export const PanelMetodoPago = ({ cuentas }: PanelMetodoPagoProps) => {
  return (
    <div className="panel_metodo_pago_contenedor">
      <h3 className="panel_titulo">Resumen por Métodos</h3>

      {cuentas?.map((cuenta) => (
        <div className="metodo_item_completo" key={cuenta.id_cuenta}>
          {/* Línea Superior: Nombre y el Total Brillante */}
          <div className="metodo_fila_principal">
            <span className="metodo_nombre">{cuenta.nombre_cuenta}</span>
            <span className="metodo_monto_total">
              ${" "}
              <CountUp
                end={cuenta.saldo_final_cuenta}
                duration={1.5}
                separator="."
                decimal=","
                decimals={2}
                preserveValue={true}
              />
            </span>
          </div>

          {/* Línea Inferior: El desglose técnico */}
          <div className="metodo_desglose">
            <div className="desglose_dato">
              <span className="dato_label">Inicial:</span>
              <span className="dato_valor">
                $
                {cuenta.inicial_cuenta.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="desglose_dato">
              <span className="dato_label">Sesión:</span>
              <span
                className={`dato_valor ${cuenta.movimiento_sesion >= 0 ? "positivo" : "negativo"}`}
              >
                {cuenta.movimiento_sesion >= 0 ? "+" : ""}$
                {cuenta.movimiento_sesion.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
