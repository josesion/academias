import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import "./graficos.css";

export interface MetodoPagoData {
  metodo: string;
  total: number;
  color: string;
}

export const GraficoMetodosPago = ({ props }: { props: MetodoPagoData[] }) => {
  return (
    <div className="grafico_metodos_pago">
      <h4>📊 Totales por Método de Pago</h4>

      <div className="grafico_metodos_pago_contenido">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={props}>
            <XAxis dataKey="metodo" stroke="#94a3b8" />

            <YAxis stroke="#94a3b8" />

            <Tooltip
              cursor={{
                fill: "rgba(255, 255, 255, 0.03)",
              }}
              contentStyle={{
                background: "var(--fondo-superficie)",
                border: "1px solid var(--borde)",
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
              formatter={(value) => `$${Number(value).toLocaleString("es-AR")}`}
            />

            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {props.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
