import "./asistencia.css";
import { Users, UserPlus } from "lucide-react";

type EstadoAsistencia = "Presente" | "Tardanza" | "Ausente";

interface DataAsistencia {
  nombre: string;
  apellido: string;
  estado?: EstadoAsistencia;
}

interface PropsAsistencia {
  alumnos: DataAsistencia[];
}

const variantesAvatar = ["", "variante_1", "variante_2"];

const obtenerIniciales = (nombre: string, apellido: string) =>
  `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

const EstadoBadge = ({
  estado = "Presente",
}: {
  estado?: EstadoAsistencia;
}) => {
  if (estado === "Presente") {
    return (
      <div className="asistencia_estado presente">
        <div className="asistencia_ecualizador">
          <span />
          <span />
          <span />
        </div>
        Presente
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

export const Asistencia = ({ alumnos }: PropsAsistencia) => {
  const presentes = alumnos.filter(
    (a) => (a.estado ?? "Presente") === "Presente",
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

      {alumnos.length === 0 ? (
        <div className="asistencia_vacio">
          <UserPlus size={40} />
          <p>Todavía no hay alumnos anotados</p>
          <span>Agregá alumnos a esta clase para ver la asistencia acá</span>
        </div>
      ) : (
        <div className="asistencia_lista">
          {alumnos.map((alumno, index) => (
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
