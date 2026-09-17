import { ImExit } from "react-icons/im";
import { MenuUsuario } from "../../Logout/Logout";

interface Props {
  usuario: string;
  abierto: boolean;
  alternar: (clave: string) => void;
  cerrar: () => void;
  onLogout: () => void;
}

export const BloqueMiCuenta = ({
  usuario,
  abierto,
  alternar,
  cerrar,
  onLogout,
}: Props) => (
  <>
    <li className="alinear" onClick={() => alternar("salir")}>
      <ImExit size={20} color="#796d6d" />
      Mi Cuenta
    </li>

    {abierto && (
      <MenuUsuario usuario={usuario} onCerrar={cerrar} onLogout={onLogout} />
    )}
  </>
);
