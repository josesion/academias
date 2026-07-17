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
        <Users size={150} />
      </div>

      <div className="asistencia_header">
        <Users size={28} />
        <h2>Alumnos en clase</h2>
        <span>{presentes} presentes</span>
      </div>

      {asistencia.length === 0 ? (
        <div className="asistencia_vacio">
          <UserPlus size={40} />
          <p>Todavía no hay alumnos anotados</p>
          <span>Agregá alumnos a esta clase para ver la asistencia acá</span>
        </div>
      ) : (
        <div className="asistencia_lista">
          {asistencia.map((alumno, index) => (
            <div className="asistencia_item" key={index}>
              <div
                className={`asistencia_icono ${variantesAvatar[index % variantesAvatar.length]}`}
              >
                {obtenerIniciales(alumno.nombre, alumno.apellido)}
              </div>

              <div className="asistencia_nombre">
                <p>{alumno.nombre}</p>
                <span>{alumno.apellido}</span>
              </div>

              <EstadoBadge estado={alumno.estado} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
