import { useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, BookOpen, User } from "lucide-react";

import "./libroDiario.css";

export interface MovimientoLibroDiario {
  id_movimiento: number;
  usuario: string;
  id_caja: number;
  fecha: string;
  hora: string;
  descripcion: string;
  tipo: "ingreso" | "egreso";
  cuenta: string;
  monto: number;
}

interface LibroDiarioProps {
  movimientos: MovimientoLibroDiario[];
}

const formatearMoneda = (valor: number) =>
  valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
  });

export const LibroDiarioGeneral = ({ movimientos }: LibroDiarioProps) => {
  // ============================================================
  // SALDO ACUMULADO
  // ============================================================

  const conSaldo = useMemo(() => {
    let acumulado = 0;

    return movimientos.map((mov) => {
      acumulado += mov.tipo === "ingreso" ? mov.monto : -mov.monto;

      return {
        ...mov,
        saldo: acumulado,
      };
    });
  }, [movimientos]);

  // ============================================================
  // RESUMEN DEL PERÍODO
  // ============================================================

  const resumen = useMemo(() => {
    const entradas = movimientos
      .filter((mov) => mov.tipo === "ingreso")
      .reduce((acc, mov) => acc + mov.monto, 0);

    const salidas = movimientos
      .filter((mov) => mov.tipo === "egreso")
      .reduce((acc, mov) => acc + mov.monto, 0);

    return {
      entradas,
      salidas,
      neto: entradas - salidas,
    };
  }, [movimientos]);

  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="libro_diario_vacio">
        <BookOpen size={28} />

        <p>Todavía no hay movimientos registrados.</p>
      </div>
    );
  }

  return (
    <section className="libro_diario_contenedor">
      {/* ======================================================
                          ENCABEZADO
      ====================================================== */}

      <header className="libro_diario_encabezado">
        <div className="libro_diario_titulo">
          <BookOpen size={16} />

          <div>
            <h2>Libro diario general</h2>

            <span>Orden cronológico de todos los movimientos</span>
          </div>
        </div>

        <div className="libro_diario_resumen">
          <div className="resumen_item">
            <span className="resumen_label">Entradas</span>

            <span className="resumen_valor positivo">
              +${formatearMoneda(resumen.entradas)}
            </span>
          </div>

          <div className="resumen_item">
            <span className="resumen_label">Salidas</span>

            <span className="resumen_valor negativo">
              -${formatearMoneda(resumen.salidas)}
            </span>
          </div>

          <div className="resumen_item resumen_neto">
            <span className="resumen_label">Saldo del período</span>

            <span className="resumen_valor">
              ${formatearMoneda(resumen.neto)}
            </span>
          </div>
        </div>
      </header>

      {/* ======================================================
                            TABLA
      ====================================================== */}

      <div className="libro_diario_tabla_wrapper">
        <table className="libro_diario_tabla">
          <thead>
            <tr>
              <th className="col_fecha">Fecha</th>

              <th className="col_hora">Hora</th>

              <th className="col_concepto">Concepto</th>

              <th className="col_medio">Medio</th>

              <th className="col_monto text-right">Monto</th>

              <th className="col_saldo text-right">Saldo</th>
            </tr>
          </thead>

          <tbody>
            {conSaldo.map((mov) => (
              <tr
                key={mov.id_movimiento}
                className={`fila_movimiento ${mov.tipo}`}
              >
                <td className="col_fecha" data-label="Fecha">
                  {mov.fecha}
                </td>

                <td className="col_hora" data-label="Hora">
                  {mov.hora}
                </td>

                <td className="col_concepto" data-label="Concepto">
                  <div className="concepto_contenido">
                    <span
                      className={`concepto_icono ${
                        mov.tipo === "ingreso"
                          ? "icono_ingreso"
                          : "icono_egreso"
                      }`}
                    >
                      {mov.tipo === "ingreso" ? (
                        <ArrowDownLeft size={13} />
                      ) : (
                        <ArrowUpRight size={13} />
                      )}
                    </span>

                    <div className="concepto_texto">
                      <span className="concepto_desc">{mov.descripcion}</span>

                      <span className="concepto_ref">
                        Caja #{mov.id_caja}
                        <span className="concepto_ref_separador">·</span>
                        <User size={10} />
                        {mov.usuario}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="col_medio" data-label="Medio">
                  <span className="medio_pill">{mov.cuenta}</span>
                </td>

                <td
                  className={`col_monto text-right ${
                    mov.tipo === "ingreso" ? "monto_positivo" : "monto_negativo"
                  }`}
                  data-label="Monto"
                >
                  {mov.tipo === "ingreso" ? "+" : "-"}$
                  {formatearMoneda(mov.monto)}
                </td>

                <td className="col_saldo text-right" data-label="Saldo">
                  ${formatearMoneda(mov.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
