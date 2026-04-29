import "./movimientocaja.css";

// Definimos qué datos necesita cada fila
export interface Movimiento {
  id_movimiento: number;
  monto: number;
  descripcion: string | null;
  referencia_id: number | null; // Lo agregamos porque está en tu SQL
  nombre_categoria: string;
  tipo_movimiento: "ingreso" | "egreso"; // Refleja el tipo de movimiento de la categoría

  // Nuevos campos de la tabla cuentas_escuela
  nombre_cuenta: string; // Ej: "Efectivo", "Mercado Pago"
  tipo_cuenta: "fisico" | "virtual";

  // Campos formateados por MySQL
  fecha_grupo: string; // Formato 'YYYY-MM-DD'
  hora_formateada: string; // Formato 'HH:mm'
}

interface MovimientoCajaProps {
  movimientos: Movimiento[];
}

export const MovientoCaja = ({ movimientos }: MovimientoCajaProps) => {
  return (
    <div className="movimiento_detalle_contenedor">
      <table className="tabla-finanzas">
        <tbody>
          {movimientos
            .filter((mov) => mov.nombre_categoria !== "Saldo Inicial") // Filtro para no mostrar saldos iniciales
            .map((mov) => (
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
                <td>{mov.nombre_cuenta}</td>
                <td>{mov.tipo_cuenta}</td>
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
