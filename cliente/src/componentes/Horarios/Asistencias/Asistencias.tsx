import "./asistencia.css";
import { UserPlus } from "lucide-react";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";

type EstadoAsistencia = "presente" | "Tardanza" | "Ausente";

interface DataAsistencia {
  nombre: string;
  apellido: string;
  estado?: EstadoAsistencia;
}

interface DatosClase {
  nombre_clase: string;
  horario: string;
  nombre_profesor: string;
}

interface AsistenciaProps {
  asistencia: DataAsistencia[];
  clases: DatosClase | null;
  estadoClase: "EN CURSO" | "SIN CURSO";
  cargaClases: boolean;
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

export const Asistencia = ({
  asistencia,
  clases,
  estadoClase,
  cargaClases,
}: AsistenciaProps) => {
  const presentes = asistencia.filter(
    (a) => (a.estado ?? "presente") === "presente",
  ).length;

  const nombreClase = clases?.nombre_clase || "Sin Clase.";
  const horarioClase = clases?.horario || "Sin Horario.";
  const profesorClase = clases?.nombre_profesor || "Sin Profesor.";

  return (
    <section className="asistencia_contenedor">
      {/* BLOQUE DE INFORMACIÓN DE CLASE (SUPERIOR) */}
      <div className="asistencia_bloque_info">
        <div className="info_clases_datos">
          <div className="info_clases_item">
            <span className="info_clases_label">Clase</span>
            {cargaClases ? (
              <SpinnerTarjeta />
            ) : (
              <h2 title={nombreClase}>{nombreClase}</h2>
            )}
          </div>

          <div className="info_clases_divisor"></div>

          <div className="info_clases_item">
            <span className="info_clases_label">Horario</span>
            {cargaClases ? (
              <SpinnerTarjeta />
            ) : (
              <p title={horarioClase}>{horarioClase}</p>
            )}
          </div>

          <div className="info_clases_divisor"></div>

          <div className="info_clases_item">
            <span className="info_clases_label">Profesor</span>
            {cargaClases ? (
              <SpinnerTarjeta />
            ) : (
              <p title={profesorClase}>{profesorClase}</p>
            )}
          </div>
        </div>

        <div
          className={`info_clases_estado ${
            estadoClase === "EN CURSO" ? "curso" : "sin_curso"
          }`}
        >
          <span className="estado_punto"></span>
          {estadoClase}
        </div>
      </div>

      {/* LÍNEA DIVISORIA ENTRE LA CLASE Y LA ASISTENCIA */}
      <div className="asistencia_seccion_divisor"></div>

      {/* BLOQUE DE CONTROL DE ASISTENCIA (INFERIOR) */}
      <div className="asistencia_bloque_principal">
        <header className="asistencia_header">
          <div className="asistencia_header_info">
            <h3>Control de Asistencia</h3>
            <p>Listado de alumnos de la clase</p>
          </div>
          <div className="asistencia_contador_badge">
            <span className="punto_activo"></span>
            <strong>{presentes}</strong> presentes
          </div>
        </header>

        {asistencia.length === 0 ? (
          <div className="asistencia_vacio">
            <div className="asistencia_vacio_icono">
              <UserPlus size={44} />
            </div>
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

                <div className="asistencia_estado_wrapper">
                  <EstadoBadge estado={alumno.estado} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
