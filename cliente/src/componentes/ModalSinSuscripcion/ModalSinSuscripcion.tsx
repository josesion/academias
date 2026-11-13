import { useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { RutasProtegidasContext } from "../../contexto/protectRutas";
import { useModalAccesible } from "../../hooks/useModalAccesible";

import "./ModalSinSuscripcion.css";

interface ModalSinSuscripcionProps {
  /** `true` bloquea la ruta: no se pinta el contenido detrás del modal */
  abierto: boolean;
}

/**
 * Modal de bloqueo para cuentas de rol "usuario" que todavía no tienen
 * ninguna suscripción en la BD (`estado_suscripcion` viene `null`).
 *
 * Va montado en `Rutas.Protegidas` sin `<Outlet />` detrás, así que la única
 * salida es cerrar la sesión: `cerrarSesion()` del contexto limpia el estado
 * (`autenticado`, `usuarioInfo`, `rol`, `localStorage`) y `navegar` lleva al
 * login sin recargar. La cookie `token` es `httpOnly` → la única forma de
 * borrarla del todo es un logout del server (pendiente de decidir).
 *
 * @param props - `abierto`: si es `false` no renderiza nada.
 */
export const ModalSinSuscripcion = ({ abierto }: ModalSinSuscripcionProps) => {
  const { cerrarSesion } = useContext(RutasProtegidasContext);
  const navegar = useNavigate();

  /**
   * 🔒 Cierre de sesión vía contexto (el mismo camino del logout del menú)
   * y navegación al login sin `window.location.href`.
   */
  const handleCerrarSesion = () => {
    cerrarSesion();
    navegar("/login");
  };

  /**
   * 🔒 Bloqueo sin salida: es el único modal con `cerrable: false`, porque la
   * regla del negocio es que no se pueda esquivar (spec 014). El foco igual
   * entra, queda atrapado y vuelve al elemento que lo abrió.
   *
   * Va ANTES del `if (!abierto) return null` de abajo por las Rules of Hooks:
   * los hooks se tienen que llamar siempre y en el mismo orden.
   */
  const { refDialog } = useModalAccesible({
    abierto,
    onCerrar: handleCerrarSesion,
    cerrable: false,
  });

  if (!abierto) return null;

  return createPortal(
    <div className="modal-sin-susp-overlay">
      <div
        ref={refDialog}
        className="modal-sin-susp-tarjeta"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo_sin_susp"
        aria-describedby="desc_sin_susp"
      >
        {/* ---------- ÍCONO ---------- */}
        <div className="modal-sin-susp-icono">
          <span className="modal-sin-susp-anillo" />
          <span className="modal-sin-susp-anillo retraso" />
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* ---------- TEXTO ---------- */}
        <h2 id="titulo_sin_susp" className="modal-sin-susp-titulo">
          Sin suscripción activa
        </h2>
        <p id="desc_sin_susp" className="modal-sin-susp-desc">
          Tu cuenta todavía no tiene ninguna suscripción. Adquirí una para poder
          usar la plataforma.
        </p>

        {/* ---------- ACCIÓN ---------- */}
        <div className="modal-sin-susp-acciones">
          <button
            type="button"
            className="modal-sin-susp-btn-primario"
            onClick={handleCerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
