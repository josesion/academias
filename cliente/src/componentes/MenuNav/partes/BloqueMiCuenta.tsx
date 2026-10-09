import { ImExit } from "react-icons/im";
import { MenuUsuario } from "../../Logout/Logout";

interface Props {
  usuario: string;
  abierto: boolean;
  alternar: (clave: string) => void;
  cerrar: () => void;
  onLogout: () => void;
}

/**
 * Bloque "Mi Cuenta" del usuario y del alumno.
 *
 * El ítem es un `<button aria-expanded>` real (antes era un `<li onClick>` sin
 * foco, spec 014) y el panel se enlaza con `aria-controls`.
 *
 * @param usuario - Nombre del usuario conectado.
 * @param abierto - Si el panel está desplegado.
 * @param alternar - Abre o cierra el panel.
 * @param cerrar - Cierra el panel.
 * @param onLogout - Cierra la sesión.
 */
export const BloqueMiCuenta = ({
  usuario,
  abierto,
  alternar,
  cerrar,
  onLogout,
}: Props) => {
  const idPanel = "menu_usuario_cliente";

  return (
    <>
      <li className="alinear">
        <button
          type="button"
          className="menu_control"
          onClick={() => alternar("salir")}
          aria-expanded={abierto}
          aria-controls={idPanel}
        >
          <ImExit size={20} color="#796d6d" />
          Mi Cuenta
        </button>
      </li>

      {abierto && (
        <MenuUsuario
          id={idPanel}
          usuario={usuario}
          onCerrar={cerrar}
          onLogout={onLogout}
        />
      )}
    </>
  );
};