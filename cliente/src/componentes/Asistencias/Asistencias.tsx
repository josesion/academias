import "./asistencia.css";
import { Users, UserPlus } from "lucide-react";
import { ComponenteCargando } from "../Cargando/Cargando";

type EstadoAsistencia = "presente" | "Tardanza" | "Ausente";

interface DataAsistencia {
  nombre: string;
  apellido: string;
  estado?: EstadoAsistencia;
}

interface AsistenciaProps {
  asistencia: DataAsistencia[]; // Aquí le dices que espera una propiedad llamada "data"
}

const variantesAvatar = ["", "variante_1", "variante_2"];

const obtenerIniciales = (nombre: string, apellido: string) =>
  `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

const EstadoBadge = ({
  estado = "presente",
}: {
  estado?: EstadoAsistencia;
}) => {
  if (estado === "presente") {
    return (
      <div className="asistencia_estado presente">
        <div className="asistencia_ecualizador">
          <span />
          <span />
          <span />
        </div>
        presente
      </div>
    );
  }

  if (estado === "Tardanza") {
    return (
      <div className="asistencia_estado tardanza">
        <div className="asistencia_punto" />
        Tardanza
      </div>
    );
  }

  return (
    <div className="asistencia_estado ausente">
      <div className="asistencia_punto" />
      Ausente
    </div>
  );
};

export const Asistencia = ({ asistencia }: AsistenciaProps) => {
  const presentes = asistencia.filter(
    (a) => (a.estado ?? "presente") === "presente",
  ).length;

  return (
    <section className="asistencia_contenedor">
      <div className="asistencia_bg_icon">
        <Users size={170} />
      </div>

      <header className="asistencia_header">
        <div className="asistencia_header_titulo">
          <div>
            <p>Control de asistencia</p>
          </div>
        </div>

        <span className="asistencia_total">{presentes} presentes</span>
      </header>

      {asistencia.length === 0 ? (
        <div className="asistencia_vacio">
          <UserPlus size={44} />

          <h3>Sin alumnos registrados</h3>

          <p>
            Agregá alumnos a esta clase para comenzar a visualizar la
            asistencia.
          </p>
        </div>
      ) : (
        <div className="asistencia_lista">
          {asistencia.map((alumno, index) => (
            <article className="asistencia_item" key={index}>
              <div
                className={`asistencia_icono ${
                  variantesAvatar[index % variantesAvatar.length]
                }`}
              >
                {obtenerIniciales(alumno.nombre, alumno.apellido)}
              </div>

              <div className="asistencia_nombre">
                <p>{alumno.nombre}</p>
                <span>{alumno.apellido}</span>
              </div>

              <div className="asistencia_estado">
                <EstadoBadge estado={alumno.estado} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
