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
    <section className="asistencia_contenedor" role="list" aria-label="Lista de asistencia de la clase">
      {/* BLOQUE DE INFORMACIÓN DE CLASE (SUPERIOR) */}
      <div className="asistencia_bloque_info">
        <div className="info_clases_datos">
          <div className="info_clases_item">
            <span className="info_clases_label">Clase</span>
            {cargaClases ? (
              <SpinnerTarjeta aria-label="Cargando clase" />
            ) : (
              <h2 title={nombreClase}>{nombreClase}</h2>
            )}
          </div>

          <div className="info_clases_divisor" aria-hidden="true"></div>

          <div className="info_clases_item">
            <span className="info_clases_label">Horario</span>
            {cargaClases ? (
              <SpinnerTarjeta aria-label="Cargando horario" />
            ) : (
              <p title={horarioClase}>{horarioClase}</p>
            )}
          </div>

          <div className="info_clases_divisor" aria-hidden="true"></div>

          <div className="info_clases_item">
            <span className="info_clases_label">Profesor</span>
            {cargaClases ? (
              <SpinnerTarjeta aria-label="Cargando profesor" />
            ) : (
              <p title={profesorClase}>{profesorClase}</p>
            )}
          </div>
        </div>

        <div
          className={`info_clases_estado ${
            estadoClase === "EN CURSO" ? "curso" : "sin_curso"
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="estado_punto" aria-hidden="true"></span>
          {estadoClase}
        </div>
      </div>

      {/* LÍNEA DIVISORIA ENTRE LA CLASE Y LA ASISTENCIA */}
      <div className="asistencia_seccion_divisor" aria-hidden="true"></div>

      {/* BLOQUE DE CONTROL DE ASISTENCIA (INFERIOR) */}
      <div className="asistencia_bloque_principal">
        <header className="asistencia_header">
          <div className="asistencia_header_info">
            <h3>Control de Asistencia</h3>
            <p>Listado de alumnos de la clase</p>
          </div>
          <div className="asistencia_contador_badge">
            <span className="punto_activo" aria-hidden="true"></span>
            <strong>{presentes}</strong> presentes
          </div>
        </header>

        {asistencia.length === 0 ? (
          <div className="asistencia_vacio" role="status" aria-live="polite" aria-label="Sin alumnos registrados en esta clase">
            <div className="asistencia_vacio_icono" aria-hidden="true">
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
              <article className="asistencia_item" role="listitem" key={index} aria-label={`${alumno.nombre} ${alumno.apellido}`}>
                <div
                  className={`asistencia_icono ${
                    variantesAvatar[index % variantesAvatar.length]
                  }`}
                  aria-hidden="true"
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
