import { useMemo } from "react";
import { BookOpen, ArrowDownLeft, ArrowUpRight } from "lucide-react";

import "./libroDiario.css";

export interface MovimientoLibroDiario {
  id_movimiento: number;
  usuario: string;
  id_caja: number;
  fecha: string;
  hora: string;
  categoria: string;
  descripcion: string | null;
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

const codigoAsiento = (id: number) => String(id).padStart(4, "0");

export const LibroDiarioGeneral = ({ movimientos }: LibroDiarioProps) => {
  console.log(movimientos);

  const totales = useMemo(() => {
    const debe = movimientos
      .filter((m) => m.tipo === "ingreso")
      .reduce((acc, m) => acc + Number(m.monto), 0);

    const haber = movimientos
      .filter((m) => m.tipo === "egreso")
      .reduce((acc, m) => acc + Number(m.monto), 0);

    return {
      debe,
      haber,
      total: debe - haber,
    };
  }, [movimientos]);

  console.log(totales);

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
      {/* =====================================================
          TABLA
          ===================================================== */}
      <div className="libro_diario_tabla_wrapper">
        <table className="libro_diario_tabla_clasica">
          <thead>
            <tr>
              <th className="col_cod">Cód.</th>
              <th className="col_fecha">Fecha</th>
              <th className="col_cuenta">Concepto</th>
              <th className="col_debe text-right">Debe</th>
              <th className="col_haber text-right">Haber</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id_movimiento} className="fila_asiento">
                <td className="col_cod" data-label="Cód.">
                  {codigoAsiento(mov.id_movimiento)}
                </td>

                <td className="col_fecha" data-label="Fecha">
                  {mov.fecha}
                  <span className="fecha_hora"> {mov.hora}</span>
                </td>

                <td className="col_cuenta" data-label="Concepto">
                  <div className="cuenta_contenido">
                    <span
                      className={`cuenta_icono ${
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

                    <div className="cuenta_texto">
                      <span className="cuenta_categoria">{mov.categoria}</span>
                      <span className="cuenta_meta">
                        {mov.cuenta}
                        {" · "}
                        Caja #{mov.id_caja}
                        {" · "}
                        {mov.usuario}
                      </span>
                      {mov.descripcion && (
                        <span className="cuenta_descripcion">
                          {mov.descripcion}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="col_debe text-right" data-label="Debe">
                  {mov.tipo === "ingreso" ? formatearMoneda(mov.monto) : ""}
                </td>

                <td className="col_haber text-right" data-label="Haber">
                  {mov.tipo === "egreso" ? formatearMoneda(mov.monto) : ""}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="fila_totales">
              <td colSpan={3}>Totales</td>
              <td className="text-right">${formatearMoneda(totales.debe)}</td>
              <td className="text-right">${formatearMoneda(totales.haber)}</td>
            </tr>

            <tr className="fila_total_general">
              <td colSpan={4}>Total general</td>
              <td className="text-right">${formatearMoneda(totales.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};
