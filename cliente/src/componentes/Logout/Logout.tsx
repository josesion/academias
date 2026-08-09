import { ImExit } from "react-icons/im";
import { VscAccount } from "react-icons/vsc";

import "./logout.css";

interface PropsMenuUsuario {
  usuario: string;
  onCerrar: () => void;
  onLogout: () => void;
}

export const MenuUsuario = ({
  usuario,
  onCerrar,
  onLogout,
}: PropsMenuUsuario) => {
  return (
    <>
      <div className="menu_usuario_backdrop" onClick={onCerrar} />

      <div className="menu_usuario_panel">
        <div className="menu_usuario_header">
          <div className="menu_usuario_avatar">
            <VscAccount size={28} />
          </div>

          <div className="menu_usuario_info">
            <span className="menu_usuario_label">Usuario conectado</span>

            <h3>{usuario}</h3>
          </div>
        </div>

        <div className="menu_usuario_divisor" />

        <button className="menu_usuario_logout" onClick={onLogout}>
          <ImExit size={18} />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  );
};
