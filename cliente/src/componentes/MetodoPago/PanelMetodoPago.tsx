import "./panelmovimientopago.css";
import CountUp from "react-countup"; // No olvides la importación

interface metricasTipoCuentas {
  id_cuenta: number | string;
  nombre_cuenta: string;
  tipo_cuenta: string | null;
  saldo: string;
}

interface PanelMetodoPagoProps {
  cuentas: metricasTipoCuentas[] | null;
}

export const PanelMetodoPago = ({ cuentas }: PanelMetodoPagoProps) => {
  return (
    <div className="panel_metodo_pago_contenedor">
      <h3 className="panel_titulo">Resumen por Métodos</h3>

      {cuentas
        ?.filter((c) => c.id_cuenta !== "TOTAL") // Filtramos el total general para no repetirlo
        .map((cuenta) => (
          <div className="metodo_item" key={cuenta.id_cuenta}>
            {" "}
            {/* Key agregada */}
            <span className="metodo_nombre">{cuenta.nombre_cuenta}</span>
            <span className="metodo_monto">
              ${" "}
              <CountUp
                end={Number(cuenta.saldo)}
                duration={1.5}
                separator="."
                decimal=","
                decimals={2} // Agregado para que siempre muestre los centavos
                preserveValue={true}
              />
            </span>
          </div>
        ))}
    </div>
  );
};
