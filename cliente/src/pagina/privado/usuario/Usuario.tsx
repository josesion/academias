import "./usuario.css";

import { TarjetaMetrica } from "../../../componentes/TajetaMetricas/TarjetaMetrica";
import { type MetricasProps } from "../../../componentes/TajetaMetricas/TarjetaMetrica";

const data: MetricasProps = {
  valor: 150,
  titulo: "total de alumnos",
  porcentaje: -10,
  tipo: "vencidos",
};

const metricasData: MetricasProps[] = [
  { titulo: "Total Alumnos", valor: 150, porcentaje: 5, tipo: "activos" },
  { titulo: "Nuevos Inscritos", valor: 30, porcentaje: 12, tipo: "nuevos" },
  { titulo: "Vencidos", valor: 12, tipo: "vencidos" },
  { titulo: "Por vencer", valor: 8, tipo: "por_vencer" },
];

export const UsuarioPage = () => {
  return (
    <div className="usuario_contenedor">
      {/* SECCIÓN DE METRICAS Y BOTONES */}

      <TarjetaMetrica {...metricasData[0]} />
      <TarjetaMetrica {...metricasData[1]} />
      <TarjetaMetrica {...metricasData[2]} />
      <TarjetaMetrica {...metricasData[3]} />
    </div>
  );
};
