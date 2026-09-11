import React from "react";
import { Clock, User, BookOpen } from "lucide-react";
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

  return (
    <div className="modal-overlay">
      <div className="modal-grilla-card">
        <div className="modal-grilla-header">
          <div>
            <h2>Grilla de Horarios</h2>
            <p>
              Conocé los días, disciplinas, niveles y profesores de la academia.
            </p>
          </div>
          <button className="btn-cerrar-modal" onClick={onCerrar}>
            ✕
          </button>
        </div>

        <div className="modal-grilla-body">
          {horarios.length === 0 ? (
            <p className="sin-horarios">
              No hay horarios cargados para esta escuela.
            </p>
          ) : (
            <>
              {/* ==============================
                  VISTA CALENDARIO (pantallas grandes)
              ============================== */}
              <div className="calendario-semanal">
                {DIAS_ORDEN.map((dia) => {
                  const clasesDelDia = horariosPorDia[dia];
                  return (
                    <div key={dia} className="columna-dia">
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
                          <div className="columna-dia-vacio">Sin clases</div>
                        ) : (
                          clasesDelDia.map((clase) => (
                            <div
                              key={clase.id}
                              className="tarjeta-clase-calendario"
                            >
                              <div className="clase-horario-badge">
                                <Clock size={12} />
                                <span>
                                  {clase.hora_inicio}-{clase.hora_fin}
                                </span>
                              </div>
                              <h4 className="clase-tipo-calendario">
                                {clase.tipo_clase}
                              </h4>
                              <div className="clase-detalles-meta-calendario">
                                <span className="meta-badge nivel">
                                  <BookOpen size={11} /> {clase.nivel}
                                </span>
                                <span className="meta-badge profesor">
                                  <User size={11} /> {clase.nombre_profesor}
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
              <div className="dias-contenedor">
                {DIAS_ORDEN.map((dia) => {
                  const clasesDelDia = horariosPorDia[dia];
                  if (!clasesDelDia || clasesDelDia.length === 0) return null;

                  return (
                    <div key={dia} className="dia-seccion">
                      <h3 className="dia-titulo">{DIAS_LABELS[dia]}</h3>
                      <div className="clases-grid-dia">
                        {clasesDelDia.map((clase) => (
                          <div key={clase.id} className="tarjeta-clase-item">
                            <div className="clase-horario-badge">
                              <Clock size={13} />
                              <span>
                                {clase.hora_inicio} - {clase.hora_fin} hs
                              </span>
                            </div>

                            <h4 className="clase-tipo">{clase.tipo_clase}</h4>

                            <div className="clase-detalles-meta">
                              <span className="meta-badge nivel">
                                <BookOpen size={12} /> {clase.nivel}
                              </span>
                              <span className="meta-badge profesor">
                                <User size={12} /> Prof. {clase.nombre_profesor}
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
  );
};
