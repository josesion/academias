import { useMemo } from "react";

import type {
  ArqueoCajaResumen,
} from "../../../servicio/historial.cajas.fetch";

import "./arqueodiferencia.css";

interface ArqueoDiferenciaProps {
  /**
   * Arqueo de la caja (el `dataArqueo` que devuelve el server en el libro
   * diario). Si viene `null` o sin desglose, la sección **no** se muestra.
   */
  data: ArqueoCajaResumen | null;
}

/**
 * Formatea un monto con el formato `es-AR` (punto para miles, coma para
 * decimales), igual que el resto de la pantalla.
 *
 * @param {number} valor - Monto a formatear.
 * @returns {string} El monto formateado (sin símbolo de moneda).
 */
const formatearMonto = (valor: number): string =>
  Number(valor || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Formatea una diferencia con el **signo adelante** del símbolo (`+$500,00`,
 * `-$500,00`) y sin `+$0` cuando es exactamente cero.
 *
 * @param {number} diferencia - Diferencia a formatear.
 * @returns {string} La diferencia formateada con signo explícito.
 */
const formatearDiferencia = (diferencia: number): string => {
  if (diferencia > 0) {
    return `+$${formatearMonto(diferencia)}`;
  }

  if (diferencia < 0) {
    return `-$${formatearMonto(Math.abs(diferencia))}`;
  }

  return `$${formatearMonto(0)}`;
};

/**
 * Devuelve el texto que acompaña siempre al color de la diferencia
 * (la diferencia nunca se comunica sólo con color).
 *
 * @param {number} diferencia - Diferencia de la cuenta.
 * @returns {"Sobrante" | "Faltante" | "Exacto"} El texto descriptivo de la diferencia.
 */
const textoDiferencia = (diferencia: number): "Sobrante" | "Faltante" | "Exacto" => {
  if (diferencia > 0) return "Sobrante";
  if (diferencia < 0) return "Faltante";
  return "Exacto";
};

/**
 * Devuelve la variante visual del badge de la diferencia.
 *
 * @param {number} diferencia - Diferencia de la cuenta.
 * @returns {"positivo" | "negativo" | "ok"} La variante de la clase del badge.
 */
const varianteDiferencia = (diferencia: number): "positivo" | "negativo" | "ok" => {
  if (diferencia > 0) return "positivo";
  if (diferencia < 0) return "negativo";
  return "ok";
};

/**
 * Sección "Diferencia por método de pago" del modal "Libro diario".
 *
 * Muestra, por cada cuenta (método de pago) de la caja, cuánto decía el
 * sistema (`sistema`), cuánto contó el cajero (`real`) y la diferencia
 * (`real − sistema`) con signo, color **y** texto ("Sobrante" / "Faltante" /
 * "Exacto").
 *
 * En el pie compara el total del desglose con la diferencia total de la caja
 * (`diferencia_total` del server) y, si no coinciden, avisa con una nota
 * informativa (no es un error: pasa con las cajas cerradas antes de la
 * corrección del guardado del arqueo, spec 042).
 *
 * Si la caja no tiene arqueo (`data` `null` o `detalle` vacío) **no** se
 * renderiza nada: no se muestra un bloque vacío.
 */
export const ArqueoDiferencia = ({ data }: ArqueoDiferenciaProps) => {
  const detalle = useMemo(() => data?.detalle ?? [], [data]);

  /** Filas del desglose con la diferencia ya calculada (`real − sistema`). */
  const filas = useMemo(
    () =>
      detalle.map((item) => {
        const sistema = Number(item.sistema) || 0;
        const real = Number(item.real) || 0;

        return {
          id_cuenta: item.id_cuenta,
          nombre_cuenta: item.nombre_cuenta,
          sistema,
          real,
          diferencia: real - sistema,
        };
      }),
    [detalle],
  );

  /** Suma de las diferencias de las filas (el "total del desglose"). */
  const sumaDesglose = useMemo(
    () => filas.reduce((acc, fila) => acc + fila.diferencia, 0),
    [filas],
  );

  if (!data || detalle.length === 0) {
    return null;
  }

  const diferenciaTotal = Number(data.diferencia_total) || 0;
  const hayDesajuste = Math.abs(sumaDesglose - diferenciaTotal) > 0.01;

  return (
    <section
      className="arqueo_diferencia"
      aria-labelledby="titulo_arqueo_diferencia"
    >
      <h3 className="arqueo_diferencia_titulo" id="titulo_arqueo_diferencia">
        Diferencia por método de pago
      </h3>

      <div className="arqueo_diferencia_tabla_wrapper">
        <table className="arqueo_diferencia_tabla">
          <thead>
            <tr>
              <th scope="col">Método de pago</th>
              <th scope="col" className="arqueo_diferencia_col_der">
                Sistema
              </th>
              <th scope="col" className="arqueo_diferencia_col_der">
                Conteo real
              </th>
              <th scope="col" className="arqueo_diferencia_col_der">
                Diferencia
              </th>
            </tr>
          </thead>

          <tbody>
            {filas.map((fila) => (
              <tr key={fila.id_cuenta} className="arqueo_diferencia_fila">
                <td
                  className="arqueo_diferencia_cuenta"
                  data-label="Método de pago"
                >
                  {fila.nombre_cuenta}
                </td>

                <td
                  className="arqueo_diferencia_num"
                  data-label="Sistema"
                >
                  ${formatearMonto(fila.sistema)}
                </td>

                <td
                  className="arqueo_diferencia_num"
                  data-label="Conteo real"
                >
                  ${formatearMonto(fila.real)}
                </td>

                <td
                  className="arqueo_diferencia_num"
                  data-label="Diferencia"
                >
                  <span
                    className={`badge_diferencia ${varianteDiferencia(
                      fila.diferencia,
                    )}`}
                  >
                    <span className="arqueo_diferencia_badge_monto">
                      {formatearDiferencia(fila.diferencia)}
                    </span>
                    <span className="arqueo_diferencia_badge_texto">
                      {textoDiferencia(fila.diferencia)}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="arqueo_diferencia_fila_totales">
              <td colSpan={3}>Total del desglose</td>
              <td className="arqueo_diferencia_num">
                {formatearDiferencia(sumaDesglose)}
              </td>
            </tr>

            <tr className="arqueo_diferencia_fila_total_caja">
              <td colSpan={3}>Diferencia total de la caja</td>
              <td className="arqueo_diferencia_num">
                {formatearDiferencia(diferenciaTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {hayDesajuste && (
        <p className="arqueo_diferencia_nota" aria-live="polite">
          El desglose guardado no coincide con la diferencia total de la caja
          (total del desglose: {formatearDiferencia(sumaDesglose)}; diferencia
          total de la caja: {formatearDiferencia(diferenciaTotal)}). Suele
          ocurrir con las cajas cerradas antes de la corrección del guardado
          del arqueo.
        </p>
      )}
    </section>
  );
};
