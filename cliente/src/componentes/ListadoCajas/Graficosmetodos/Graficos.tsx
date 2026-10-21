import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ComponenteCargando } from "../../generales/Cargando/Cargando";

import "./graficos.css";

export interface MetodoPagoData {
  metodo: string;
  total: number;
  color?: string;
}

interface MetodosPagoProps {
  carga?: boolean; // ? es por el momento hasta hacer el metodo de pargo de una caja por pcaja
  props: MetodoPagoData[];
  /**
   * Título del gráfico (spec 042 · Ampliación 3 · A4). Se usa en el
   * `<figcaption>` y en el `aria-label` del `<svg role="img">`.
   * Si no se pasa, se usa el título por defecto.
   */
  titulo?: string;
}

/** Título por defecto del gráfico (si el call site no pasa `titulo`). */
export const TITULO_POR_DEFECTO_METODOS_PAGO = "Totales por Método de Pago";

/**
 * Genera el `aria-label` dinámico del gráfico.
 *
 * El texto incluye el **título** del gráfico (para que el lector de voz
 * diga qué métrica se está mostrando) y el porcentaje de cada método.
 *
 * @param {MetodoPagoData[]} data - Datos a graficar (método y total).
 * @param {string} titulo - Título del gráfico.
 * @returns {string} Etiqueta accesible del gráfico.
 */
const generarAriaLabel = (data: MetodoPagoData[], titulo: string): string => {
  if (!data || data.length === 0) {
    return `${titulo}: sin datos`;
  }
  // Los montos llegan como DECIMAL (texto) desde el server: se normalizan a número
  const total = data.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0,
  );
  const partes = data.map((item) => {
    const monto = Number(item.total) || 0;
    const pct = total > 0 ? Math.round((monto / total) * 100) : 0;
    return `${item.metodo} ${pct}%`;
  });
  return `${titulo}: ${partes.join(", ")}`;
};

export const GraficoMetodosPago = ({ carga, props, titulo }: MetodosPagoProps) => {
  const tituloGrafico = titulo ?? TITULO_POR_DEFECTO_METODOS_PAGO;
  const ariaLabel = generarAriaLabel(props, tituloGrafico);

  return (
    <figure className="grafico_metodos_pago">
      <figcaption className="grafico_subtitulo">{tituloGrafico}</figcaption>
      {carga ? (
        <ComponenteCargando local />
      ) : (
        <div className="grafico_metodos_pago_contenido">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={props}>
              {/* El color de los ejes lo define el CSS (graficos.css → var(--borde)) */}
              <XAxis dataKey="metodo" />

              <YAxis />

              <Tooltip
                cursor={{
                  fill: "var(--fondo-hover)",
                }}
                contentStyle={{
                  background: "var(--fondo-superficie)",
                  border: "1px solid var(--borde-hover)",
                  borderRadius: "var(--radio-sm)",
                  color: "var(--texto-principal)",
                  boxShadow: "var(--sombra-md)",
                }}
                labelStyle={{
                  color: "var(--texto-secundario)",
                  fontFamily: "var(--fuente-principal)",
                  fontSize: "12px",
                }}
                itemStyle={{
                  color: "var(--texto-principal)",
                  fontFamily: "var(--fuente-principal)",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
                formatter={(value) =>
                  `$${Number(value).toLocaleString("es-AR")}`
                }
              />

              {/* `minPointSize` dibuja una barra mínima para los valores en 0:
                  sin esto, un método de pago sin movimientos (ej.: Mercado Pago
                  con $0 circulado) no se ve en el gráfico y parece un método
                  faltante, cuando en realidad sí estáconsidered. */}
              <Bar
                dataKey="total"
                radius={[4, 4, 0, 0]}
                minPointSize={4}
              >
                {props.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <svg
        role="img"
        aria-label={ariaLabel}
        className="visually-hidden"
        aria-hidden="true"
      />
    </figure>
  );
};
