import "./panelmovimientopago.css";
import CountUp from "react-countup"; // No olvides la importación

interface PanelMetodoPagoProps {
  totales: {
    efectivo: number;
    transferencia: number;
    credito: number;
    debito: number;
  };
}

export const PanelMetodoPAgo = ({ totales }: PanelMetodoPagoProps) => {
  return (
    <div className="panel_metodo_pago_contenedor">
      <h3 className="panel_titulo">Resumen por Métodos</h3>

      <div className="metodo_item">
        <span className="metodo_nombre">Efectivo</span>
        <span className="metodo_monto">
          ${" "}
          <CountUp
            end={totales.efectivo}
            duration={1.5}
            separator="."
            decimal=","
            preserveValue={true}
          />
        </span>
      </div>

      <div className="metodo_item">
        <span className="metodo_nombre">Transferencia</span>
        <span className="metodo_monto">
          ${" "}
          <CountUp
            end={totales.transferencia}
            duration={1.5}
            separator="."
            decimal=","
            preserveValue={true}
          />
        </span>
      </div>

      <div className="metodo_item">
        <span className="metodo_nombre">Crédito</span>
        <span className="metodo_monto">
          ${" "}
          <CountUp
            end={totales.credito}
            duration={1.5}
            separator="."
            decimal=","
            preserveValue={true}
          />
        </span>
      </div>

      <div className="metodo_item">
        <span className="metodo_nombre">Débito</span>
        <span className="metodo_monto">
          ${" "}
          <CountUp
            end={totales.debito}
            duration={1.5}
            separator="."
            decimal=","
            preserveValue={true}
          />
        </span>
      </div>
    </div>
  );
};
