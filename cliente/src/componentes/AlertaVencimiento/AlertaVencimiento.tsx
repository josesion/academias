import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { diasHastaVencimiento } from "../../utils/fecha";
import "./AlertaVencimiento.css";

interface AlertaVencimientoProps {
  fechaVencimiento: string | Date | null | undefined;
  carga?: boolean;
  mensajeError?: string | null | boolean;
  onCerrar?: () => void;
  onAccionPrincipal?: () => void;
}

export const AlertaVencimiento: React.FC<AlertaVencimientoProps> = ({
  fechaVencimiento,
  carga,
  mensajeError,
  onCerrar,
  onAccionPrincipal,
}) => {
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true); // Por defecto visible si hay error o carga

  useEffect(() => {
    if (!fechaVencimiento || carga || mensajeError) return;

    const dias = diasHastaVencimiento(fechaVencimiento);

    setDiasRestantes(dias);
    setIsVisible(dias !== null && dias <= 7);
  }, [fechaVencimiento, carga, mensajeError]);

  if (!isVisible && !carga && !mensajeError) return null;

  // Clases dinámicas de urgencia
  let claseUrgencia = "";
  if (mensajeError) {
    claseUrgencia = "error";
  } else if (diasRestantes !== null) {
    if (diasRestantes <= 0) claseUrgencia = "critico";
    else if (diasRestantes <= 3) claseUrgencia = "urgente";
  }

  const maxDias = 7;
  const progreso =
    diasRestantes !== null
      ? Math.max(0, Math.min(diasRestantes, maxDias)) / maxDias
      : 0;
  const dashOffset = 163.36 * (1 - progreso);

  // Se renderiza en un PORTAL a document.body, igual que `ModalVencimiento`.
  // Motivo: esta tarjeta es `position: fixed`, y un elemento con `transform`
  // (≠ none) se vuelve el bloque contenedor de sus descendientes fijos. La
  // pagina de usuario hace `.usuario_metricas_grupo2:hover { scale(0.98) }`, y como
  // esta alerta vivia DENTRO de esa seccion, al hacer hover sobre el historial
  // la seccion se escalaba y la alerta se movia y se encogia con ella
  // (360 x 0.98 = 352.8px). Con el portal queda colgada del body y no la
  // captura ningun ancestro.
  return createPortal(
    <div
      className={`alerta-vencimiento ${claseUrgencia} ${carga ? "es-cargando" : ""}`}
    >
      <div className="alerta-contenido">
        {/* ESTADO DE CARGA (SKELETON) */}
        {carga ? (
          <>
            <div className="alerta-medidor skeleton-circulo"></div>
            <div className="skeleton-linea skeleton-linea-titulo"></div>
            <div className="skeleton-linea skeleton-linea-desc"></div>
          </>
        ) : mensajeError ? (
          /* ESTADO DE ERROR (Elegante y limpio) */
          <>
            <div className="alerta-medidor alerta-medidor-error">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="alerta-titulo">Error de Verificación</h2>
            <p className="alerta-desc">
              {typeof mensajeError === "string"
                ? mensajeError
                : "No se pudo comprobar el estado de la suscripción con el servidor."}
            </p>
            <div className="alerta-acciones">
              {onCerrar && (
                <button className="alerta-btn-volver" onClick={onCerrar}>
                  Ocultar aviso
                </button>
              )}
            </div>
          </>
        ) : (
          /* ESTADO NORMAL / VENCIDO */
          <>
            <div className="alerta-medidor">
              <div className="alerta-onda"></div>
              <div className="alerta-onda retraso"></div>

              <svg className="alerta-anillo" viewBox="0 0 60 60">
                <circle className="anillo-base" cx="30" cy="30" r="26" />
                <circle
                  className="anillo-progreso"
                  cx="30"
                  cy="30"
                  r="26"
                  style={{
                    strokeDasharray: 163.36,
                    strokeDashoffset: dashOffset,
                  }}
                />
              </svg>

              <div className="alerta-numero">
                <strong>
                  {diasRestantes !== null && diasRestantes < 0
                    ? "0"
                    : diasRestantes}
                </strong>
                <small>{diasRestantes === 1 ? "Día" : "Días"}</small>
              </div>
            </div>

            <h2 className="alerta-titulo">
              {diasRestantes !== null && diasRestantes < 0
                ? "¡Suscripción Vencida!"
                : diasRestantes === 0
                  ? "¡Tu suscripción vence hoy!"
                  : "Tu plan está por vencer"}
            </h2>

            <p className="alerta-desc">
              {diasRestantes !== null && diasRestantes < 0
                ? "El periodo de acceso ha finalizado. Por favor, regularizá tu situación para continuar operando."
                : `Te quedan ${diasRestantes} ${diasRestantes === 1 ? "día" : "días"} hábiles para renovar tu suscripción y evitar interrupciones.`}
            </p>

            <div className="alerta-acciones">
              {onAccionPrincipal && (
                <button className="alerta-cta" onClick={onAccionPrincipal}>
                  <span>Renovar / Contactar</span>
                </button>
              )}

              {onCerrar && (
                <button className="alerta-btn-volver" onClick={onCerrar}>
                  Continuar por ahora
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
