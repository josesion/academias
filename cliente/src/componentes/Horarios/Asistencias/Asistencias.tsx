import "./asistencia.css";
import { ChevronDown, ChevronUp, Loader2, UserPlus } from "lucide-react";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { useState, useMemo } from "react";
import type { HorarioConAlumnos } from "../../../servicio/asistencia.fetch";
import type { ResultAsistencia } from "../../../servicio/metrica.fetch";

type EstadoAsistencia = "presente" | "Tardanza" | "Ausente";

/** Clase en curso con sus alumnos */
interface ClaseConAsistencia {
  id_clase: number;
  nombre_clase: string;
  horario: string;
  nombre_profesor: string;
  sala: string;
  alumnos: ResultAsistencia[];
}

interface AsistenciaProps {
  /** Array de clases en curso, cada una con sus alumnos */
  asistencia: ClaseConAsistencia[];
  /** Clases en curso (para marcar badge en horarios del día) */
  clases: DatosClase[] | null;
  estadoClase: "EN CURSO" | "SIN CURSO";
  cargaClases: boolean;
  horariosDelDia: HorarioConAlumnos[];
  cargaHorarios: boolean;
  errorHorarios: string | null;
}

/** Información de una clase en curso (solo para badge en horarios) */
interface DatosClase {
  nombre_clase: string;
  horario: string;
  nombre_profesor: string;
  id_clase?: number;
  sala?: string;
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
 * Convierte un alumno del backend (nombre_completo) al formato simple
 * usado por el componente en horarios del día. El estado siempre es "presente"
 * porque el backend ya filtra por `estado = 'presente'`.
 */
const alumnoBackendASimple = (
  nombreCompleto: string,
) => {
  const partes = nombreCompleto.trim().split(" ");
  const apellido = partes.length >= 2 ? partes[partes.length - 1] : "";
  const nombre = partes.length >= 2 ? partes.slice(0, -1).join(" ") : partes[0];
  return { nombre, apellido };
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
  // Acordeón de clases en curso (izquierda)
  const [clasesExpandidas, setClasesExpandidas] = useState<Set<number>>(
    new Set(),
  );

  // Acordeón de horarios del día (derecha)
  const [horariosExpandidos, setHorariosExpandidos] = useState<Set<number>>(
    new Set(),
  );

  /** Alterna el estado expandido de una clase en curso */
  const toggleClase = (id: number) => {
    setClasesExpandidas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) {
        siguiente.delete(id);
      } else {
        siguiente.add(id);
      }
      return siguiente;
    });
  };

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

  // IDs de las clases en curso para marcar en el acordeón de horarios
  const idsClasesEnCurso = new Set(
    (clases ?? []).map((c) => c.id_clase).filter((id): id is number => id != null),
  );

  // Total de alumnos presentes en todas las clases en curso
  const totalPresentes = useMemo(
    () => asistencia.reduce((sum, c) => sum + c.alumnos.length, 0),
    [asistencia],
  );

  return (
    <section className="asistencia_contenedor" role="list" aria-label="Lista de asistencia de la clase">
      {/* BLOQUE DE ESTADO SUPERIOR */}
      <div className="asistencia_bloque_info">
        <div className="info_clases_datos">
          <div className="info_clases_item">
            <span className="info_clases_label">Clases en curso</span>
            {cargaClases ? (
              <SpinnerTarjeta aria-label="Cargando clases" />
            ) : (
              <h2>
                {asistencia.length > 0
                  ? `${asistencia.length} clase${asistencia.length > 1 ? 's' : ''}`
                  : "Sin clase"}
              </h2>
            )}
          </div>

          <div className="info_clases_divisor" aria-hidden="true"></div>

          <div className="info_clases_item">
            <span className="info_clases_label">Alumnos presentes</span>
            {cargaClases ? (
              <SpinnerTarjeta aria-label="Cargando alumnos" />
            ) : (
              <p>{totalPresentes}</p>
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

      {/* LÍNEA DIVISORIA */}
      <div className="asistencia_seccion_divisor" aria-hidden="true"></div>

      {/* CONTENEDOR LADO A LADO: Clases en curso + Horarios del día */}
      <div className="asistencia_lado_a_lado">
        {/* COLUMNA IZQUIERDA: Acordeón de clases en curso */}
        <div className="asistencia_bloque_principal">
          <header className="asistencia_header">
            <div className="asistencia_header_info">
              <h3>Clases en curso</h3>
              <p>Alumnos por clase</p>
            </div>
            {!cargaClases && totalPresentes > 0 && (
              <div className="asistencia_contador_badge">
                <span className="punto_activo" aria-hidden="true"></span>
                <strong>{totalPresentes}</strong> presentes
              </div>
            )}
          </header>

          {cargaClases ? (
            <div className="horarios_cargando" role="status">
              <Loader2 size={20} className="horarios_cargando_icono" />
              <p>Cargando clases...</p>
            </div>
          ) : asistencia.length === 0 ? (
            <div className="asistencia_vacio" role="status" aria-live="polite">
              <div className="asistencia_vacio_icono" aria-hidden="true">
                <UserPlus size={44} />
              </div>
              <h3>Sin clases en curso</h3>
              <p>
                No hay clases activas en este momento. Revisá los horarios del día.
              </p>
            </div>
          ) : (
            <div className="clases_acordeon" role="list" aria-label="Clases en curso">
              {asistencia.map((clase) => {
                const expandida = clasesExpandidas.has(clase.id_clase);
                const horarioRelacionado = horariosDelDia.find(
                  (horario) => horario.id_horario_clase === clase.id_clase,
                );
                const presentesClase = clase.alumnos.filter(
                  (a) => (a.estado ?? "presente") === "presente",
                ).length;

                return (
                  <div
                    key={clase.id_clase}
                    className={`clase_item en_curso ${expandida ? "expandido" : ""}`}
                    role="listitem"
                  >
                    {/* Encabezado clickeable de la clase */}
                    <button
                      type="button"
                      className="clase_encabezado"
                      onClick={() => toggleClase(clase.id_clase)}
                      aria-expanded={expandida}
                      aria-label={`${clase.horario} ${clase.nombre_clase}, profesor ${clase.nombre_profesor}${horarioRelacionado ? `, tipo ${horarioRelacionado.tipo_clase}, nivel ${horarioRelacionado.nivel}` : ""}, sala ${clase.sala}`}
                    >
                      <div className="clase_encabezado_contenido">
                        <div className="clase_encabezado_fila_principal">
                          <span className="clase_horario">{clase.horario}</span>
                          <span className="clase_nombre">{clase.nombre_clase}</span>
                        </div>

                        <div className="clase_encabezado_fila_detalles">
                          {horarioRelacionado && (
                            <>
                              <span className="clase_tipo">
                                Tipo: {horarioRelacionado.tipo_clase}
                              </span>
                              <span className="clase_profesor">
                                {clase.nombre_profesor}
                              </span>
                              <span className="clase_nivel">
                                Nivel: {horarioRelacionado.nivel}
                              </span>
                            </>
                          )}
                          {!horarioRelacionado && (
                            <span className="clase_profesor">
                              {clase.nombre_profesor}
                            </span>
                          )}
                          <span className="clase_sala" title={clase.sala}>
                            {clase.sala}
                          </span>
                          <span className="horario_badge_en_curso">En curso</span>
                          {expandida && presentesClase > 0 && (
                            <span className="clase_presentes">
                              {presentesClase} presente{presentesClase > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="clase_flecha" aria-hidden="true">
                        {expandida ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </button>

                    {/* Panel expandido con alumnos de esta clase */}
                    {expandida && (
                      <div className="clase_alumnos">
                        {clase.alumnos.length === 0 ? (
                          <div className="horario_vacio" role="status">
                            <p>Sin alumnos registrados en esta clase.</p>
                          </div>
                        ) : (
                          <div className="asistencia_lista">
                            {clase.alumnos.map((alumno, index) => (
                              <article
                                className="asistencia_item"
                                role="listitem"
                                key={`${alumno.nombre}-${alumno.apellido}-${index}`}
                                aria-label={`${alumno.nombre} ${alumno.apellido}`}
                              >
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
                    )}
                  </div>
                );
              })}
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
                const enCurso = idsClasesEnCurso.has(horario.id_horario_clase);
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
                      aria-label={`${horario.hora_inicio} a ${horario.hora_fin}, ${horario.tipo_clase}, profesor ${horario.profesor}, nivel ${horario.nivel}, sala ${horario.sala ?? "Sin sala"}`}
                    >
                      <div className="horario_encabezado_contenido">
                        <div className="horario_encabezado_fila_principal">
                          <span className="horario_hora">
                            {horario.hora_inicio} — {horario.hora_fin}
                          </span>
                          <span className="horario_tipo">{horario.tipo_clase}</span>
                        </div>

                        <div className="horario_encabezado_fila_detalles">
                          <span className="horario_profesor">
                            {horario.profesor}
                          </span>
                          <span className="horario_nivel">
                            Nivel: {horario.nivel}
                          </span>
                          <span
                            className="horario_sala"
                            title={horario.sala ?? "Sin sala"}
                          >
                            {horario.sala ?? "Sin sala"}
                          </span>
                          {enCurso && (
                            <span className="horario_badge_en_curso">En curso</span>
                          )}
                        </div>
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
                              const dataAlumno = alumnoBackendASimple(alumno.nombre_completo);
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
