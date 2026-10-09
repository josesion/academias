import { ImExit } from "react-icons/im";
import { VscAccount } from "react-icons/vsc";

import "./logout.css";

interface PropsMenuUsuario {
  usuario: string;
  onCerrar: () => void;
  onLogout: () => void;
  /**
   * `id` del panel, para que el botón que lo abre pueda anunciarlo con
   * `aria-controls` (spec 014). Opcional: si no viene, el panel queda sin id.
   */
  id?: string;
}

/**
 * Panel de "Mi Cuenta": avatar del usuario y botón de cerrar sesión.
 *
 * Es un panel flotante, no un modal: no tiene trampa de foco ni Escape (para
 * eso está `useModalAccesible`), solo se cierra con el backdrop o al elegir una
 * opción.
 *
 * @param usuario - Nombre del usuario conectado.
 * @param onCerrar - Cierra el panel (click en el backdrop).
 * @param onLogout - Cierra la sesión.
 * @param id - `id` opcional para enlazar con `aria-controls`.
 */
export const MenuUsuario = ({
  usuario,
  onCerrar,
  onLogout,
  id,
}: PropsMenuUsuario) => {
  return (
    <>
      <div className="menu_usuario_backdrop" onClick={onCerrar} />

      <div className="menu_usuario_panel" id={id}>
        <div className="menu_usuario_header">
          <div className="menu_usuario_avatar">
            <VscAccount size={28} />
          </div>

          <div className="menu_usuario_info">
            <span className="menu_usuario_label">Usuario conectado</span>

            <h3>{usuario}</h3>
          </div>
        </div>

        <div className="menu_usuario_divider" />

        <button className="menu_usuario_logout" onClick={onLogout}>
          <ImExit size={18} />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  );
};
