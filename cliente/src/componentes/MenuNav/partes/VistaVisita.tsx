import { Link } from "react-router-dom";
import { GiBlackBook } from "react-icons/gi";
import { VscAccount } from "react-icons/vsc";

/**
 * Menú de visitante (sin sesión): solo Inicio y Login.
 *
 * Los ítems son `<Link>` de react-router y no `<li onClick>` (spec 014): el
 * `<Link>` genera un `href` real, así que funcionan Enter, middle-click,
 * ctrl+click y "abrir en pestaña nueva", y el lector de voz los anuncia como
 * enlaces en vez de elementos sin rol.
 *
 * El `<li>` se conserva como estructura para no romper el layout de
 * `.menu_nav_lista .alinear` (flex + space-between + padding): el aspecto lo
 * aporta la clase `.menu_control`, que se la pasa a `<li>` en `menuNav.css`.
 */
export const VistaVisita = () => (
  <>
    <li className="alinear">
      <Link className="menu_control" to="/">
        <GiBlackBook size={20} /> Inicio
      </Link>
    </li>

    <li className="alinear">
      <Link className="menu_control" to="/login">
        <VscAccount size={20} /> Login
      </Link>
    </li>
  </>
);