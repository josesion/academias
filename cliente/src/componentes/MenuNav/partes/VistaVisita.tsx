import { NavLink } from "react-router-dom";
import { GiBlackBook } from "react-icons/gi";
import { VscAccount } from "react-icons/vsc";

interface Props {
  /** Cierra el submenú y el menú móvil: lo usan los ítems al navegar (spec 018). */
  cerrarMenu: () => void;
}

/**
 * Menú de visitante (sin sesión): solo Inicio y Login.
 *
 * Los ítems son `<NavLink>` de react-router y no `<li onClick>` (spec 014): el
 * enlace genera un `href` real, así que funcionan Enter, middle-click,
 * ctrl+click y "abrir en pestaña nueva", y el lector de voz los anuncia como
 * enlaces en vez de elementos sin rol. Con `NavLink` además se marca cuál es la
 * ruta activa (spec 018).
 *
 * El `<li>` se conserva como estructura para no romper el layout de
 * `.menu_nav_lista .alinear` (flex + space-between + padding): el aspecto lo
 * aporta la clase `.menu_control`, que se la pasa a `<li>` en `menuNav.css`.
 *
 * @param cerrarMenu - Cierra el menú móvil al navegar.
 */
export const VistaVisita = ({ cerrarMenu }: Props) => (
  <>
    <li className="alinear">
      <NavLink className="menu_control" to="/" onClick={cerrarMenu}>
        <GiBlackBook size={20} /> Inicio
      </NavLink>
    </li>

    <li className="alinear">
      <NavLink className="menu_control" to="/login" onClick={cerrarMenu}>
        <VscAccount size={20} /> Login
      </NavLink>
    </li>
  </>
);