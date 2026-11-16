import "./asistencia.css";
import { ChevronDown, ChevronUp, Loader2, UserPlus } from "lucide-react";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { useState } from "react";
import type { HorarioConAlumnos } from "../../../servicio/asistencia.fetch";

type EstadoAsistencia = "presente" | "Tardanza" | "Ausente";

/** Alumno con estado de asistencia */
interface DataAsistencia {
  nombre: string;
  apellido: string;
  estado?: EstadoAsistencia;
}

/** Información de la clase actual */
interface DatosClase {
  nombre_clase: string;
  horario: string;
  nombre_profesor: string;
  id_clase?: number;
}

interface AsistenciaProps {
  asistencia: DataAsistencia[];
  clases: DatosClase | null;
  estadoClase: "EN CURSO" | "SIN CURSO";
  cargaClases: boolean;
  horariosDelDia: HorarioConAlumnos[];
  cargaHorarios: boolean;
  errorHorarios: string | null;
}

const variantesAvatar = ["", "variante_1", "variante_2"];

/** Devuelve las iniciales a partir de un nombre completo ("Nombre Apellido"). */
const obtenerIniciales = (nombreCompleto: string) => {
  const partes = nombreCompleto.trim().split(" ");
  if (partes.length >= 2) {
    return `${partes[0].charAt(0)}${partes[partes.length - 1].charAt(0)}`.toUpperCase();
  }
  return partes[0]?.charAt(0).toUpperCase() ?? "?";
};

/**
 * Convierte un alumno del backend (nombre_completo) al formato DataAsistencia
 * usado por el componente. El estado siempre es "presente" porque el backend
 * ya filtra por `estado = 'presente'`.
 */
const alumnoBackendADataAsistencia = (
  nombreCompleto: string,
): DataAsistencia => {
  const partes = nombreCompleto.trim().split(" ");
  const apellido = partes.length >= 2 ? partes[partes.length - 1] : "";
  const nombre = partes.length >= 2 ? partes.slice(0, -1).join(" ") : partes[0];
  return { nombre, apellido, estado: "presente" };
};

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
  horariosDelDia,
  cargaHorarios,
  errorHorarios,
}: AsistenciaProps) => {
  // Estado local solo para controlar qué acordeones están expandidos (UI)
  const [horariosExpandidos, setHorariosExpandidos] = useState<Set<number>>(
    new Set(),
  );

  /** Alterna el estado expandido de un horario */
  const toggleHorario = (id: number) => {
    setHorariosExpandidos((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) {
        siguiente.delete(id);
      } else {
        siguiente.add(id);
      }
      return siguiente;
    });
  };

  // Contador de presentes en la clase actual
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

      {/* LÍNEA DIVISORIA ENTRE LA CLASE Y EL CONTENIDO INFERIOR */}
      <div className="asistencia_seccion_divisor" aria-hidden="true"></div>

      {/* CONTENEDOR LADO A LADO: Control de Asistencia + Horarios del día */}
      <div className="asistencia_lado_a_lado">
        {/* COLUMNA IZQUIERDA: Control de Asistencia (clase actual) */}
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
                    {obtenerIniciales(`${alumno.nombre} ${alumno.apellido}`)}
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

        {/* COLUMNA DERECHA: Horarios del día */}
        <div className="horarios_del_dia">
          <header className="horarios_header">
            <h3>Horarios del día</h3>
            <p>Clases programadas para hoy</p>
          </header>

          <div className="horarios_acordeon" role="list" aria-label="Horarios del día">
            {cargaHorarios ? (
              <div className="horarios_cargando" role="status">
                <Loader2 size={20} className="horarios_cargando_icono" />
                <p>Cargando horarios...</p>
              </div>
            ) : errorHorarios ? (
              <div className="horarios_error" role="status">
                <p>{errorHorarios}</p>
              </div>
            ) : horariosDelDia.length === 0 ? (
              <div className="horarios_vacio_dia" role="status">
                <h3>Sin asistencias hoy</h3>
                <p>No hay alumnos registrados en clases para hoy.</p>
              </div>
            ) : (
              horariosDelDia.map((horario) => {
                const expandido = horariosExpandidos.has(horario.id_horario_clase);
                const idClaseEnCurso = clases?.id_clase;
                const enCurso = idClaseEnCurso != null && horario.id_horario_clase === idClaseEnCurso;
                const alumnos = horario.alumnos;

                return (
                  <div
                    key={horario.id_horario_clase}
                    className={`horario_item ${enCurso ? "en_curso" : ""} ${expandido ? "expandido" : ""}`}
                    role="listitem"
                  >
                    {/* Encabezado clickeable del horario */}
                    <button
                      type="button"
                      className="horario_encabezado"
                      onClick={() => toggleHorario(horario.id_horario_clase)}
                      aria-expanded={expandido}
                      aria-label={`${horario.hora_inicio} - ${horario.hora_fin} ${horario.tipo_clase} ${horario.nivel}`}
                    >
                      <div className="horario_encabezado_izq">
                        <span className="horario_hora">
                          {horario.hora_inicio} — {horario.hora_fin}
                        </span>
                        {enCurso && (
                          <span className="horario_badge_en_curso">En curso</span>
                        )}
                      </div>

                      <div className="horario_encabezado_der">
                        <span className="horario_tipo">{horario.tipo_clase}</span>
                        <span className="horario_nivel">{horario.nivel}</span>
                        <span className="horario_profesor">{horario.profesor}</span>
                      </div>

                      <div className="horario_flecha" aria-hidden="true">
                        {expandido ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </button>

                    {/* Panel expandido con alumnos */}
                    {expandido && (
                      <div className="horario_alumnos">
                        {alumnos.length === 0 ? (
                          <div className="horario_vacio" role="status">
                            <p>Sin alumnos registrados en este horario.</p>
                          </div>
                        ) : (
                          <div className="asistencia_lista">
                            {alumnos.map((alumno, index) => {
                              const dataAlumno = alumnoBackendADataAsistencia(alumno.nombre_completo);
                              return (
                                <article
                                  className="asistencia_item"
                                  role="listitem"
                                  key={alumno.dni_alumno}
                                  aria-label={alumno.nombre_completo}
                                >
                                  <div
                                    className={`asistencia_icono ${
                                      variantesAvatar[index % variantesAvatar.length]
                                    }`}
                                    aria-hidden="true"
                                  >
                                    {obtenerIniciales(alumno.nombre_completo)}
                                  </div>

                                  <div className="asistencia_nombre">
                                    <p>{dataAlumno.nombre}</p>
                                    <span>{dataAlumno.apellido}</span>
                                  </div>

                                  <div className="asistencia_estado_wrapper">
                                    <EstadoBadge estado="presente" />
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
