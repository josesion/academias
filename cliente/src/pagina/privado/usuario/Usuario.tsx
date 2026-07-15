import "./usuario.css";

import { TarjetaMetrica } from "../../../componentes/TajetaMetricas/TarjetaMetrica";
import { InfoClases } from "../../../componentes/Clases/Clases";
import { Asistencia } from "../../../componentes/Asistencias/Asistencias";
import { type MetricasProps } from "../../../componentes/TajetaMetricas/TarjetaMetrica";

const metricasData: MetricasProps[] = [
  {
    titulo: "Total Alumnos",
    valor: 150,
    porcentaje: 5,
    tipo: "activos",
    carga: false,
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

interface DataClases {
  nombre_clase: string;
  horario: string;
  nombre_profesor: string;
  estado: "EN CURSO" | "SIN CURSO";
}

const clases: DataClases = {
  nombre_clase: "Bachata",
  horario: "10;00 -- 11:00",
  nombre_profesor: "jose lopez",
  estado: "EN CURSO",
};

const alumnosPrueba = [
  {
    nombre: "Sofía",
    apellido: "Gómez",
  },
  {
    nombre: "Mateo",
    apellido: "Fernández",
  },
  {
    nombre: "Valentina",
    apellido: "Rodríguez",
  },
  {
    nombre: "Thiago",
    apellido: "Martínez",
  },
  {
    nombre: "Camila",
    apellido: "López",
  },
  {
    nombre: "Benjamín",
    apellido: "Sánchez",
  },
  {
    nombre: "Martina",
    apellido: "Pérez",
  },
  {
    nombre: "Joaquín",
    apellido: "Díaz",
  },
  {
    nombre: "Mía",
    apellido: "Torres",
  },
  {
    nombre: "Franco",
    apellido: "Ramírez",
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
      <section className="usuario_contenido">
        <InfoClases
          estado={clases.estado}
          horario={clases.horario}
          nombre_clase={clases.nombre_clase}
          nombre_profesor={clases.nombre_profesor}
        />

        <Asistencia alumnos={alumnosPrueba} />
      </section>
    </div>
  );
};
