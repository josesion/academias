import "./movimientocaja.css";

// Definimos qué datos necesita cada fila
export interface Movimiento {
  id_movimiento: number;
  hora_formateada: string;
  descripcion: string | null;
  nombre_categoria: string;
  monto: number;
  tipo_movimiento: string;
  fecha_grupo: string;
  metodo_pago: "efectivo" | "transferencia" | "tarjeta" | "otro";
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
              key={mov.id_movimiento}
              className={
                mov.tipo_movimiento === "ingreso"
                  ? "fila-ingreso"
                  : "fila-egreso"
              }
            >
              <td>{mov.fecha_grupo}</td>

              <td>{mov.hora_formateada}</td>
              <td>{mov.metodo_pago}</td>
              <td>{mov.nombre_categoria}</td>

              <td
                className={
                  mov.tipo_movimiento === "ingreso"
                    ? "monto-positivo"
                    : "monto-negativo"
                }
              >
                {mov.tipo_movimiento === "ingreso" ? "+" : "-"} $
                {mov.monto.toLocaleString("es-AR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
