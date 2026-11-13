import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import type { SeccionMenu } from "../menu.types";

interface Props {
  seccion: SeccionMenu;
  abierta: boolean;
  alternar: (clave: string) => void;
  /** Cierra el submenú y el menú móvil: lo usan los ítems al navegar (spec 018). */
  cerrarMenu: () => void;
}

/**
 * Sección del menú que se despliega (spec 014, ajustada en la 018).
 *
 * La cabecera es un `<button aria-expanded>` real: antes era un `<li onClick>`,
 * que no era enfocable ni activable con Enter ni con Espacio (spec 014).
 * Los ítems del submenú son `<NavLink>`: cada uno es un destino, así que
 * corresponde un enlace con `href` real, y además aportan el marcado de ruta
 * activa (`aria-current` + `.activo`) (spec 018).
 *
 * El `<li>` sigue siendo la estructura (el layout lo aporta
 * `.menu_nav_lista .alinear`) y el `<ul>` del submenú va con el `id` que
 * anuncia el `aria-controls` del botón.
 *
 * @param seccion - Datos de la sección (clave, etiqueta, ícono e ítems).
 * @param abierta - Si el submenú está desplegado.
 * @param alternar - Abre o cierra la sección por su clave.
 * @param cerrarMenu - Cierra el submenú y el menú móvil al navegar.
 */
export const SeccionDesplegable = ({
  seccion,
  abierta,
  alternar,
  cerrarMenu,
}: Props) => {
  const Icono = seccion.icono;
  const idSubmenu = `submenu_${seccion.clave}`;

  return (
    <li className="menu-item alinear">
      <button
        type="button"
        className={`menu_control menu_control--cabecera ${
          abierta ? "menu_control--abierto" : ""
        }`}
        onClick={() => alternar(seccion.clave)}
        aria-expanded={abierta}
        aria-controls={idSubmenu}
      >
        <span className="menu-item-cabecera">
          <Icono size={20} />
          <span>{seccion.etiqueta}</span>
        </span>

        {abierta ? <HiChevronUp size={15} /> : <HiChevronDown size={15} />}
      </button>

      {abierta && (
        <ul className="submenu" id={idSubmenu}>
          {seccion.items.map(
            ({ etiqueta, icono: IconoItem, ruta, color, tamano }) => (
              <li key={ruta}>
                <NavLink
                  className="menu_control"
                  to={ruta}
                  onClick={cerrarMenu}
                >
                  <IconoItem size={tamano ?? 18} color={color} />
                  {etiqueta}
                </NavLink>
              </li>
            ),
          )}
        </ul>
      )}
    </li>
  );
};