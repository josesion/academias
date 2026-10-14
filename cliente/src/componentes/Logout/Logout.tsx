import { ImExit } from "react-icons/im";
import { VscAccount } from "react-icons/vsc";
import { FiUser } from "react-icons/fi";

import "./logout.css";

interface PropsMenuUsuario {
  usuario: string;
  onCerrar: () => void;
  onLogout: () => void;
  onPerfil?: () => void;
  /**
   * `id` del panel, para que el botón que lo abre pueda anunciarlo con
   * `aria-controls` (spec 014). Opcional: si no viene, el panel queda sin id.
   */
  id?: string;
}

/**
 * Panel de "Mi Cuenta": avatar del usuario, acceso a perfil y cerrar sesión.
 *
 * Es un panel flotante, no un modal: no tiene trampa de foco ni Escape (para
 * eso está `useModalAccesible`), solo se cierra con el backdrop o al elegir una
 * opción.
 *
 * @param usuario - Nombre del usuario conectado.
 * @param onCerrar - Cierra el panel (click en el backdrop).
 * @param onLogout - Cierra la sesión.
 * @param onPerfil - Navega a la página de perfil (opcional).
 * @param id - `id` opcional para enlazar con `aria-controls`.
 */
export const MenuUsuario = ({
  usuario,
  onCerrar,
  onLogout,
  onPerfil,
  id,
}: PropsMenuUsuario) => {
  return (
    <>
      {/* El backdrop es decorativo: no aporta nada al lector de voz y si
          fuera enfocable crearia un segundo boton "invisible" en el tabulador. */}
      <div className="menu_usuario_backdrop" onClick={onCerrar} aria-hidden="true" />

      <div
        className="menu_usuario_panel"
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de usuario"
      >
        <div className="menu_usuario_header">
          <div className="menu_usuario_avatar" aria-hidden="true">
            <VscAccount size={28} />
          </div>

          <div className="menu_usuario_info">
            <span className="menu_usuario_label">Usuario conectado</span>

            <h3>{usuario}</h3>
          </div>
        </div>

        <div className="menu_usuario_divider" aria-hidden="true" />

        {onPerfil && (
          <button
            className="menu_usuario_opcion"
            onClick={() => {
              onPerfil();
              onCerrar();
            }}
          >
            <FiUser size={18} aria-hidden="true" />
            <span>Mi Perfil</span>
          </button>
        )}

        <div className="menu_usuario_divider" aria-hidden="true" />

        <button className="menu_usuario_logout" onClick={onLogout}>
          <ImExit size={18} aria-hidden="true" />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  );
};
