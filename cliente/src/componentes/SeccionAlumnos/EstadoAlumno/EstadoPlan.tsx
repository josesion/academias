import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

import "./estadoPlan.css";

export interface InscripcionActualData {
  id_inscripcion: number;
  id_plan: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  clases_asignadas_inscritas: number;
  meses_asignados_inscritos: number;
  monto: number;
  estado: "activos" | "suspendido" | "vencidos";
  descripcion_plan: string;
  clases_utilizadas: number;
}

interface EstadoPlanActualProps {
  inscripcion: InscripcionActualData;
  umbralAlerta?: number; // cantidad de clases restantes para disparar la alerta
}

export const EstadoPlanActual: React.FC<EstadoPlanActualProps> = ({
  inscripcion,
  umbralAlerta = 2,
}) => {
  const clasesUsadas = inscripcion.clases_utilizadas;
  const clasesTotales = inscripcion.clases_asignadas_inscritas;
  const porcentaje = Math.min(
    Math.round((clasesUsadas / clasesTotales) * 100),
    100,
  );
  const clasesRestantes = clasesTotales - clasesUsadas;

  const agotado = clasesRestantes <= 0;
  const porAgotarse = !agotado && clasesRestantes <= umbralAlerta;

  const formatearFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "Sin vencimiento";
    const [anio, mes, dia] = fechaStr.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className="seccion-bloque">
      <h2 className="seccion-titulo">Plan y Estado Actual</h2>

      <div
        className={`estado-plan-card ${agotado ? "estado-agotado" : ""} ${
          porAgotarse ? "estado-por-agotarse" : ""
        }`}
      >
        {/* Cabecera de la tarjeta */}
        <div className="estado-plan-header">
          <div className="estado-plan-titulo-box">
            <span className="badge-vigente">
              <CheckCircle2 size={14} /> {inscripcion.estado.toUpperCase()}
            </span>
            <h3>{inscripcion.descripcion_plan}</h3>
          </div>
          <span className="vencimiento-texto">
            <Clock size={14} /> Vence el:{" "}
            <strong>{formatearFecha(inscripcion.fecha_fin)}</strong>
          </span>
        </div>

        {/* Aviso de clases por agotarse / agotadas */}
        {(porAgotarse || agotado) && (
          <div className={`aviso-clases ${agotado ? "aviso-agotado" : ""}`}>
            {agotado ? <XCircle size={16} /> : <AlertTriangle size={16} />}
            <span>
              {agotado
                ? "Ya usaste todas tus clases de este plan."
                : clasesRestantes === 1
                  ? "¡Te queda 1 sola clase disponible!"
                  : `¡Te quedan solo ${clasesRestantes} clases disponibles!`}
            </span>
          </div>
        )}

        {/* Métricas de consumo */}
        <div className="estado-plan-body">
          <div className="info-metrica">
            <span className="metrica-label">Clases utilizadas</span>
            <span className="metrica-valor">
              {clasesUsadas} / {clasesTotales}
            </span>
          </div>
          <div className="info-metrica">
            <span className="metrica-label">Clases disponibles</span>
            <span
              className={`metrica-valor destacar ${
                agotado ? "valor-agotado" : porAgotarse ? "valor-alerta" : ""
              }`}
            >
              {clasesRestantes > 0
                ? `${clasesRestantes} clases restantes`
                : "Cupo agotado"}
            </span>
          </div>
        </div>

        {/* Barra de progreso basada en el snapshot de clases */}
        <div className="barra-progreso-container">
          <div
            className={`barra-progreso-fill ${
              agotado ? "fill-agotado" : porAgotarse ? "fill-alerta" : ""
            }`}
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
