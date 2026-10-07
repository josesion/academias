import { useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { RutasProtegidasContext } from "../../contexto/protectRutas";

import "./ModalVencimiento.css";

interface ModalVencimientoProps {
  abierto: boolean;
  onCerrar?: () => void;
  onRenovar?: () => void;
}

/**
 * Modal de bloqueo para cuentas cuya suscripción está `vencido`.
 *
 * Va montado en `Rutas.Protegidas` sin `<Outlet />` detrás: la única salida
 * es cerrar la sesión (`cerrarSesion()` del contexto + `navegar("/login")`,
 * sin recarga). La cookie `token` es `httpOnly` → borrarla del todo depende
 * de un logout en el server (pendiente de decidir).
 *
 * @param props - `abierto`: si es `false` no renderiza nada; `onCerrar` /
 *   `onRenovar` son callbacks opcionales del que lo monta.
 */
export const ModalVencimiento = ({
  abierto,
  onCerrar,
  onRenovar,
}: ModalVencimientoProps) => {
  const { cerrarSesion } = useContext(RutasProtegidasContext);
  const navegar = useNavigate();

  if (!abierto) return null;

  /**
   * 🔒 Cierre de sesión vía contexto (mismo camino que el logout del menú):
   * limpia el estado y la sesión local, y navega al login sin recargar.
   */
  const handleCerrarSesion = () => {
    if (onCerrar) {
      onCerrar();
    }

    cerrarSesion();
    navegar("/login");
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
