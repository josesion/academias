import React from "react";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Wallet, CalendarDays } from "lucide-react";

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
  carga: boolean;
  onVerClases?: () => void;
}

export const EstadoPlanActual: React.FC<EstadoPlanActualProps> = ({
  inscripcion,
  umbralAlerta = 2,
  carga,
  onVerClases,
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

  /**
   * Calcula los días restantes hasta el vencimiento del plan.
   */
  const diasRestantes = (() => {
    if (!inscripcion.fecha_fin) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date(inscripcion.fecha_fin + "T00:00:00");
    const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  })();

  const formatearFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "Sin vencimiento";
    const [anio, mes, dia] = fechaStr.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  /**
   * Formatea el monto como moneda argentina.
   */
  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  /**
   * Determina la clase CSS del badge según el estado de la inscripción.
   */
  const getEstadoBadgeClass = () => {
    switch (inscripcion.estado) {
      case "activos":
        return "badge-activo";
      case "suspendido":
        return "badge-suspendido";
      case "vencidos":
        return "badge-vencido";
      default:
        return "";
    }
  };

  return (
    <div className="seccion-bloque">
      <h2 className="seccion-titulo">Plan y Estado Actual</h2>

      {carga ? (
        <SpinnerTarjeta />
      ) : (
        <>
          <div
            className={`estado-plan-card ${agotado ? "estado-agotado" : ""} ${porAgotarse ? "estado-por-agotarse" : ""}`}
          >
            {/* Cabecera de la tarjeta */}
            <div className="estado-plan-header">
              <div className="estado-plan-titulo-box">
                <span className={`badge-vigente ${getEstadoBadgeClass()}`}>
                  <CheckCircle2 size={14} aria-hidden="true" /> {inscripcion.estado.toUpperCase()}
                </span>
                <h3>{inscripcion.descripcion_plan}</h3>
              </div>
              <div className="estado-plan-meta">
                <span className="vencimiento-texto">
                  <Clock size={14} aria-hidden="true" /> Vence el:{" "}
                  <strong>{formatearFecha(inscripcion.fecha_fin)}</strong>
                </span>
                {diasRestantes !== null && (
                  <span className={`dias-restantes-badge ${diasRestantes <= 0 ? "dias-vencido" : diasRestantes <= umbralAlerta ? "dias-por-vencer" : ""}`}>
                    <CalendarDays size={14} aria-hidden="true" />
                    {diasRestantes > 0
                      ? `${diasRestantes} días restantes`
                      : diasRestantes === 0
                      ? "Vence hoy"
                      : `${Math.abs(diasRestantes)} días vencido`}
                  </span>
                )}
              </div>
            </div>

            {/* Aviso de clases por agotarse / agotadas */}
            {(porAgotarse || agotado) && (
              <div
                className={`aviso-clases ${agotado ? "aviso-agotado" : ""}`}
                role="alert"
                aria-live={agotado ? "assertive" : "polite"}
              >
                {agotado ? <XCircle size={16} aria-hidden="true" /> : <AlertTriangle size={16} aria-hidden="true" />}
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
                  className={`metrica-valor destacar ${agotado ? "valor-agotado" : porAgotarse ? "valor-alerta" : ""}`}
                >
                  {clasesRestantes > 0 ? `${clasesRestantes} clases restantes` : "Cupo agotado"}
                </span>
              </div>
              <div className="info-metrica">
                <span className="metrica-label">
                  <Wallet size={14} aria-hidden="true" /> Monto pagado
                </span>
                <span className="metrica-valor monto-pagado">
                  {formatearMonto(inscripcion.monto)}
                </span>
              </div>
            </div>

            {/* Barra de progreso basada en el snapshot de clases */}
            <div className="barra-progreso-container">
              <div
                role="progressbar"
                aria-valuenow={porcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso del plan: ${porcentaje}% (${clasesUsadas} de ${clasesTotales} clases)`}
                className={`barra-progreso-fill ${agotado ? "fill-agotado" : porAgotarse ? "fill-alerta" : ""}`}
                style={{ width: `${porcentaje}%` }}
              >
                <span className="visually-hidden">{porcentaje}% (${clasesUsadas} de ${clasesTotales} clases)</span>
              </div>
            </div>

            {onVerClases && (
              <button
                type="button"
                className="btn-ver-clases-asistidas"
                onClick={onVerClases}
              >
                Ver clases asistidas
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};