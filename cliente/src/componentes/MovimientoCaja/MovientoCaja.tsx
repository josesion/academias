import "./movimientocaja.css";
import {
  Calendar,
  Clock,
  Wallet,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

export interface Movimiento {
  id_movimiento: number;
  monto: number;
  descripcion: string | null;
  referencia_id: number | null;
  nombre_categoria: string;
  tipo_movimiento: "ingreso" | "egreso";

  nombre_cuenta: string;
  tipo_cuenta: "fisico" | "virtual";

  fecha_grupo: string;
  hora_formateada: string;
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
      {/* =========================
            HEADER DESKTOP
      ========================== */}

      <div className="movimiento_header">
        <span>
          <Calendar size={14} />
          Fecha
        </span>

        <span>
          <Clock size={14} />
          Hora
        </span>

        <span>
          <Wallet size={14} />
          Cuenta
        </span>

        <span>Estado</span>

        <span>
          <Landmark size={14} />
          Categoría
        </span>

        <span className="header_monto">Monto</span>
      </div>

      {/* =========================
                LISTADO
      ========================== */}

      <div className="movimiento_lista">
        {movimientos
          .filter((mov) => mov.nombre_categoria !== "Saldo Inicial")
          .map((mov) => (
            <div
              key={mov.id_movimiento}
              className={`movimiento_fila ${mov.tipo_movimiento}`}
              onClick={() =>
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
                )
              }
            >
              {/* Fecha */}

              <div className="campo campo_fecha">
                <span className="campo_label">
                  <Calendar size={12} />
                  Fecha
                </span>

                <span>{mov.fecha_grupo}</span>
              </div>

              {/* Hora */}

              <div className="campo campo_hora">
                <span className="campo_label">
                  <Clock size={12} />
                  Hora
                </span>

                <span>{mov.hora_formateada}</span>
              </div>

              {/* Cuenta */}

              <div className="campo campo_cuenta">
                <span className="campo_label">
                  <Wallet size={12} />
                  Cuenta
                </span>

                <span>{mov.nombre_cuenta}</span>
              </div>

              {/* Badge */}

              <div className="campo campo_estado">
                <span className="campo_label">Estado</span>

                <div className={`badge_estado ${mov.tipo_movimiento}`}>
                  {mov.tipo_movimiento === "ingreso" ? (
                    <>
                      <ArrowDownLeft size={14} />
                      Ingreso
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={14} />
                      Egreso
                    </>
                  )}
                </div>
              </div>

              {/* Categoría */}

              <div className="campo campo_categoria">
                <span className="campo_label">
                  <Landmark size={12} />
                  Categoría
                </span>

                <span>{mov.nombre_categoria}</span>
              </div>

              {/* Monto */}

              <div className={`campo campo_monto ${mov.tipo_movimiento}`}>
                {mov.tipo_movimiento === "ingreso" ? "+" : "-"} $
                {mov.monto.toLocaleString("es-AR")}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
