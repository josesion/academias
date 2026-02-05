import "./movimientocaja.css";

// Definimos qué datos necesita cada fila
export interface Movimiento {
  id: number;
  hora: string;
  detalle: string;
  metodo: string;
  monto: number;
  tipo: "ingreso" | "egreso";
}

interface MovimientoCajaProps {
  movimientos: Movimiento[];
}

export const MovientoCaja = ({ movimientos }: MovimientoCajaProps) => {
  return (
    <div className="movimiento_detalle_contenedor">
      <table className="tabla-finanzas">
        <tbody>
          {movimientos.map((mov) => (
            <tr
              key={mov.id}
              className={
                mov.tipo === "ingreso" ? "fila-ingreso" : "fila-egreso"
              }
            >
              <td>{mov.hora}</td>
              <td>{mov.detalle}</td>
              <td>{mov.metodo}</td>
              <td
                className={
                  mov.tipo === "ingreso" ? "monto-positivo" : "monto-negativo"
                }
              >
                {mov.tipo === "ingreso" ? "+" : "-"} $
                {mov.monto.toLocaleString("es-AR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
