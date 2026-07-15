import "./movimientocaja.css";
import { Calendar, Clock, Wallet, Landmark, Tag } from "lucide-react";

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
  observaciones: string;
  nombre_alumno_vinculado: string | null;
}

interface MovimientoCajaProps {
  movimientos: Movimiento[];
  infoDetalle: (
    id_movimiento: number,
    tipo: "ingreso" | "egreso",
    metodo: "fisico" | "virtual",
    monto: number,
    descripcion: string,
    observaciones: string | null,
    dia: string,
    hora: string,
    metodo_pago: string,
    nombre_alumno_vinculado: string | null,
  ) => void;
}

export const MovientoCaja = ({
  movimientos,
  infoDetalle,
}: MovimientoCajaProps) => {
  return (
    <div className="movimiento_detalle_contenedor">
      <div className="movimiento_header" role="row" aria-hidden="true">
        <span>
          <Calendar size={13} /> Fecha
        </span>
        <span>
          <Clock size={13} /> Hora
        </span>
        <span>
          <Wallet size={13} /> Cuenta
        </span>
        <span>Tipo</span>
        <span>
          <Landmark size={13} /> Categoría
        </span>
        <span className="header_monto">Monto</span>
      </div>

      <div className="movimiento_lista" role="table">
        {movimientos
          .filter((mov) => mov.nombre_categoria !== "Saldo Inicial") // Filtro para no mostrar saldos iniciales
          .map((mov) => (
            <div
              onClick={() => {
                infoDetalle(
                  mov.id_movimiento,
                  mov.tipo_movimiento,
                  mov.tipo_cuenta,
                  mov.monto,
                  mov.nombre_cuenta,
                  mov.descripcion,
                  mov.fecha_grupo,
                  mov.hora_formateada,
                  mov.nombre_categoria,
                  mov.nombre_alumno_vinculado,
                );
              }}
              key={mov.id_movimiento}
              role="row"
              className={
                mov.tipo_movimiento === "ingreso"
                  ? "movimiento_fila fila-ingreso"
                  : "movimiento_fila fila-egreso"
              }
            >
              <span className="campo campo_fecha" role="cell">
                <span className="campo_label">
                  <Calendar size={12} /> Fecha
                </span>
                {mov.fecha_grupo}
              </span>

              <span className="campo campo_hora" role="cell">
                <span className="campo_label">
                  <Clock size={12} /> Hora
                </span>
                {mov.hora_formateada}
              </span>

              <span className="campo campo_cuenta" role="cell">
                <span className="campo_label">
                  <Wallet size={12} /> Cuenta
                </span>
                {mov.nombre_cuenta}
              </span>

              <span className="campo campo_tipo_cuenta" role="cell">
                <span className="campo_label">Tipo</span>
                {mov.tipo_cuenta}
              </span>

              <span className="campo campo_categoria" role="cell">
                <span className="campo_label">
                  <Landmark size={12} /> Categoría
                </span>
                {mov.nombre_categoria}
              </span>

              <span
                className={
                  mov.tipo_movimiento === "ingreso"
                    ? "campo campo_monto monto-positivo"
                    : "campo campo_monto monto-negativo"
                }
                role="cell"
              >
                {mov.tipo_movimiento === "ingreso" ? "+" : "-"} $
                {mov.monto.toLocaleString("es-AR")}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};
