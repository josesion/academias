import React from "react";
import { Clock, User, BookOpen, X } from "lucide-react";
import { useModalAccesible } from "../../../hooks/useModalAccesible";
import "./grillaHorarios.css";

export interface HorarioClaseData {
  id: number;
  dia_semana:
    | "lunes"
    | "martes"
    | "miercoles"
    | "jueves"
    | "viernes"
    | "sabado"
    | "domingo";
  hora_inicio: string;
  hora_fin: string;
  tipo_clase: string;
  nivel: string;
  nombre_profesor: string;
  estado: string;
}

interface GrillaHorariosProps {
  horarios: HorarioClaseData[];
  onCerrar: () => void;
  abierto: boolean;
}

const DIAS_ORDEN = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;
const DIAS_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};
const DIAS_LABELS_CORTO: Record<string, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
  sabado: "Sáb",
  domingo: "Dom",
};

export const GrillaHorarios: React.FC<GrillaHorariosProps> = ({
  horarios,
  onCerrar,
  abierto,
}) => {
  const horariosPorDia = DIAS_ORDEN.reduce(
    (acc, dia) => {
      acc[dia] = horarios
        .filter((h) => h.dia_semana === dia)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      return acc;
    },
    {} as Record<string, HorarioClaseData[]>,
  );

  const { refDialog } = useModalAccesible({
    abierto,
    onCerrar,
  });

  return (
    <>
      {abierto && (
        <div className="modal-overlay" role="presentation">
          <div
            ref={refDialog}
            className="modal-grilla-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-horarios-titulo"
            id="modal-horarios"
          >
            <div className="modal-grilla-header">
              <div>
                <h2 id="modal-horarios-titulo">Grilla de Horarios</h2>
                <p>
                  Conocé los días, disciplinas, niveles y profesores de la academia.
                </p>
              </div>
              <button
                className="btn-cerrar-modal"
                onClick={onCerrar}
                aria-label="Cerrar grilla de horarios"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="modal-grilla-body">
              {horarios.length === 0 ? (
                <p className="sin-horarios" role="status" aria-live="polite">
                  No hay horarios cargados para esta escuela.
                </p>
              ) : (
                <>
                  {/* ==============================
                      VISTA CALENDARIO (pantallas grandes)
                  ============================== */}
                  <div
                    className="calendario-semanal"
                    role="list"
                    aria-label="Horarios semanales en vista calendario"
                  >
                    {DIAS_ORDEN.map((dia) => {
                      const clasesDelDia = horariosPorDia[dia];
                      return (
                        <div
                          key={dia}
                          className="columna-dia"
                          role="listitem"
                          aria-label={`Día ${DIAS_LABELS[dia]}`}
                        >
                          <div className="columna-dia-header">
                            <span className="columna-dia-label-largo">
                              {DIAS_LABELS[dia]}
                            </span>
                            <span className="columna-dia-label-corto">
                              {DIAS_LABELS_CORTO[dia]}
                            </span>
                          </div>

                          <div className="columna-dia-body">
                            {clasesDelDia.length === 0 ? (
                              <div className="columna-dia-vacio" role="status">
                                Sin clases
                              </div>
                            ) : (
                              clasesDelDia.map((clase) => (
                                <div
                                  key={clase.id}
                                  className="tarjeta-clase-calendario card-base"
                                  role="listitem"
                                  aria-describedby={`detalle-clase-${clase.id}`}
                                >
                                  <div className="clase-horario-badge">
                                    <Clock size={12} aria-hidden="true" />
                                    <span>
                                      {clase.hora_inicio}-{clase.hora_fin}
                                    </span>
                                  </div>
                                  <h4 className="clase-tipo-calendario">
                                    {clase.tipo_clase}
                                  </h4>
                                  <div
                                    id={`detalle-clase-${clase.id}`}
                                    className="clase-detalles-meta-calendario"
                                  >
                                    <span className="meta-badge nivel">
                                      <BookOpen size={11} aria-hidden="true" />
                                      {clase.nivel}
                                    </span>
                                    <span className="meta-badge profesor">
                                      <User size={11} aria-hidden="true" />
                                      {clase.nombre_profesor}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ==============================
                      VISTA LISTA (pantallas chicas) — la que ya tenías
                  ============================== */}
                  <div
                    className="dias-contenedor"
                    role="list"
                    aria-label="Horarios semanales en vista lista"
                  >
                    {DIAS_ORDEN.map((dia) => {
                      const clasesDelDia = horariosPorDia[dia];
                      if (!clasesDelDia || clasesDelDia.length === 0) return null;

                      return (
                        <div key={dia} className="dia-seccion" role="listitem">
                          <h3 className="dia-titulo">{DIAS_LABELS[dia]}</h3>
                          <div
                            className="clases-grid-dia"
                            role="list"
                            aria-label={`Clases de ${DIAS_LABELS[dia]}`}
                          >
                            {clasesDelDia.map((clase) => (
                              <div
                                key={clase.id}
                                className="tarjeta-clase-item card-base"
                                role="listitem"
                                aria-describedby={`detalle-clase-${clase.id}`}
                              >
                                <div className="clase-horario-badge">
                                  <Clock size={13} aria-hidden="true" />
                                  <span>
                                    {clase.hora_inicio} - {clase.hora_fin} hs
                                  </span>
                                </div>

                                <h4 className="clase-tipo">{clase.tipo_clase}</h4>

                                <div
                                  id={`detalle-clase-${clase.id}`}
                                  className="clase-detalles-meta"
                                >
                                  <span className="meta-badge nivel">
                                    <BookOpen size={12} aria-hidden="true" />
                                    {clase.nivel}
                                  </span>
                                  <span className="meta-badge profesor">
                                    <User size={12} aria-hidden="true" />
                                    Prof. {clase.nombre_profesor}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="modal-grilla-footer">
              <button className="btn-principal" onClick={onCerrar}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};