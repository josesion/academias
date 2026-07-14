import "./usuario.css";

import { TarjetaMetrica } from "../../../componentes/TajetaMetricas/TarjetaMetrica";
import { type MetricasProps } from "../../../componentes/TajetaMetricas/TarjetaMetrica";

const metricasData: MetricasProps[] = [
  {
    titulo: "Total Alumnos",
    valor: 150,
    porcentaje: 5,
    tipo: "activos",
    carga: true,
  },
  {
    titulo: "Nuevos Inscritos",
    valor: 30,
    porcentaje: 12,
    tipo: "nuevos",
    carga: false,
  },
  { titulo: "Vencidos", valor: 12, tipo: "vencidos", carga: false },
  { titulo: "Por vencer", valor: 8, tipo: "por_vencer", carga: false },
  {
    titulo: "Total caja",
    valor: 210.3,
    tipo: "caja",
    carga: false,
    leyenda: "Flujo caja",
  },
];

export const UsuarioPage = () => {
  return (
    <div className="usuario_contenedor">
      {/* =======================
          MÉTRICAS SUPERIORES
      ======================== */}
      <section className="usuario_metricas">
        {metricasData.map((metrica) => (
          <TarjetaMetrica key={metrica.titulo} {...metrica} />
        ))}
      </section>

      {/* =======================
          CONTENIDO PRINCIPAL
      ======================== */}
      <section className="usuario_contenido"></section>
    </div>
  );
};
