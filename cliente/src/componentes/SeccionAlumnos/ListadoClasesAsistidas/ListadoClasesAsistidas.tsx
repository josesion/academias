import React, { useId } from "react";
import { X, Clock, User, BookOpen, GraduationCap } from "lucide-react";
import { useModalAccesible } from "../../../hooks/useModalAccesible";

import type { AsistenciaInscripcionRow } from "../../../tipadosTs/asistencia.typado";
import "./listadoClasesAsistidas.css";

interface ListadoClasesAsistidasProps {
  abierto: boolean;
  clases: AsistenciaInscripcionRow[] | null;
  carga: boolean;
  error: string | null;
  onCerrar: () => void;
  onReintentar: () => void;
}

const formatearFecha = (fechaStr: string): string => {
  if (!fechaStr) return "—";
  const [anio, mes, dia] = fechaStr.split("-");
  return `${dia}/${mes}/${anio}`;
};

const capitalizarDia = (dia: string): string => {
  if (!dia) return "—";
  return dia.charAt(0).toUpperCase() + dia.slice(1);
};

export const ListadoClasesAsistidas: React.FC<ListadoClasesAsistidasProps> = ({
  abierto,
  clases,
  carga,
  error,
  onCerrar,
  onReintentar,
}) => {
  const tituloId = useId();
  const { refDialog } = useModalAccesible({ abierto, onCerrar });

  if (!abierto) return null;

  const sinClases = !carga && !error && (!clases || clases.length === 0);

  return (
    <div className="modal-clases-asistidas-fondo" onClick={onCerrar}>
      <div
        className="modal-clases-asistidas-contenedor"
        ref={refDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <header className="modal-clases-asistidas-header">
          <h2 id={tituloId} className="modal-clases-asistidas-titulo">
            Clases Asistidas
          </h2>
          <button
            className="modal-clases-asistidas-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar modal de clases asistidas"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {/* Contenido */}
        <div className="modal-clases-asistidas-body">
          {carga && (
            <div className="modal-clases-asistidas-carga" role="status" aria-live="polite">
              <div className="spinner-clases" aria-hidden="true" />
              <span>Cargando clases asistidas...</span>
            </div>
          )}

          {error && !carga && (
            <div className="modal-clases-asistidas-error" role="alert">
              <p>No pudimos cargar tus clases asistidas.</p>
              <button className="btn-reintentar-clases" onClick={onReintentar}>
                Reintentar
              </button>
            </div>
          )}

          {sinClases && (
            <div className="modal-clases-asistidas-vacio">
              <p>Aún no tenés clases registradas en esta academia.</p>
            </div>
          )}

          {!carga && !error && clases && clases.length > 0 && (
            <ul className="modal-clases-asistidas-lista" role="list">
              {clases.map((clase, index) => (
                <li key={`${clase.id_horario_clase}-${clase.fecha}-${index}`} className="clase-asistida-card">
                  <div className="clase-asistida-header">
                    <span className="clase-asistida-dia">{capitalizarDia(clase.dia_semana)}</span>
                    <span className="clase-asistida-fecha">{formatearFecha(clase.fecha)}</span>
                  </div>
                  <div className="clase-asistida-body">
                    <div className="clase-asistida-info">
                      <Clock size={14} aria-hidden="true" />
                      <span>{clase.hora}</span>
                    </div>
                    <div className="clase-asistida-info">
                      <BookOpen size={14} aria-hidden="true" />
                      <span>{clase.tipo_clase}</span>
                    </div>
                    <div className="clase-asistida-info">
                      <GraduationCap size={14} aria-hidden="true" />
                      <span>{clase.nivel}</span>
                    </div>
                    <div className="clase-asistida-info">
                      <User size={14} aria-hidden="true" />
                      <span>{clase.profesor}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};