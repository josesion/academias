import { createPortal } from "react-dom";
import "./ModalVencimiento.css";

interface ModalVencimientoProps {
  abierto: boolean;
  onCerrar?: () => void;
  onRenovar?: () => void;
}

export const ModalVencimiento = ({
  abierto,
  onCerrar,
  onRenovar,
}: ModalVencimientoProps) => {
  if (!abierto) return null;

  // 🔒 Función para cerrar sesión y volver al login
  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioEscuela");

    if (onCerrar) {
      onCerrar();
    }

    window.location.href = "/login";
  };

  return createPortal(
    <div className="modal-vencimiento-overlay">
      <div className="modal-vencimiento-tarjeta">
        {/* Botón de cerrar de la esquina (X) */}
        {onCerrar && (
          <button
            className="modal-vencimiento-cerrar"
            onClick={handleCerrarSesion}
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        )}

        <div className="modal-vencimiento-icono">
          <span className="modal-vencimiento-anillo" />
          <span className="modal-vencimiento-anillo retraso" />
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="modal-vencimiento-titulo">Tu plan se venció</h2>
        <p className="modal-vencimiento-desc">
          Para seguir usando todas las funciones, renová tu suscripción. Tus
          datos siguen guardados y disponibles apenas la actives de nuevo.
        </p>

        {/* ---------- BOTONES DE ACCIÓN ---------- */}
        <div className="modal-vencimiento-acciones">
          {/* Botón secundario ("Más tarde" o salir) */}
          <button
            className="modal-vencimiento-btn-primario"
            onClick={handleCerrarSesion}
          >
            Cerrar sesión / Salir
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
