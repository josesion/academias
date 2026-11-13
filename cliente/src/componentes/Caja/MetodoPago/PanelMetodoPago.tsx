import "./panelmovimientopago.css";
import CountUp from "react-countup";
import { Wallet } from "lucide-react";

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
      <div className="panel_header">
        <Wallet size={15} />
        <h3 className="panel_titulo">Resumen por Métodos</h3>
      </div>

      {!cuentas || cuentas.length === 0 ? (
        <div className="panel_vacio">
          <span>Sin cuentas activas en esta sesión</span>
        </div>
      ) : (
        <div className="panel_lista">
          {cuentas.map((cuenta, index) => {
            // Separamos la parte entera y los decimales para el saldo final
            const parteEntera = Math.floor(cuenta.saldo_final_cuenta);
            const decimales = Math.round(
              (cuenta.saldo_final_cuenta - parteEntera) * 100,
            )
              .toString()
              .padStart(2, "0");

            return (
              <div className="metodo_item_completo" key={cuenta.id_cuenta}>
                <div
                  className={`metodo_avatar ${index % 2 === 0 ? "" : "variante_1"}`}
                >
                  {cuenta.nombre_cuenta.slice(0, 2).toUpperCase()}
                </div>

                <div className="metodo_contenido">
                  <div className="metodo_fila_principal">
                    <span className="metodo_nombre">
                      {cuenta.nombre_cuenta}
                    </span>
                    <span className="metodo_monto_total">
                      <span className="monto_simbolo">$</span>
                      <CountUp
                        end={parteEntera}
                        duration={1.5}
                        separator="."
                        preserveValue={true}
                        className="monto_entero"
                      />
                      <span className="monto_decimal">,{decimales}</span>
                    </span>
                  </div>

                  <div className="metodo_desglose">
                    <div className="desglose_dato">
                      <span className="dato_label">Inicial</span>
                      <span className="dato_valor">
                        $
                        {cuenta.inicial_cuenta.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="desglose_dato">
                      <span className="dato_label">Sesión</span>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
