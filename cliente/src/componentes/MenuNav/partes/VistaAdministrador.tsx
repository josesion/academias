import { VscAccount } from "react-icons/vsc";
import { ImExit } from "react-icons/im";

interface Props {
  irA: (ruta: string) => void;
}

export const VistaAdministrador = ({ irA }: Props) => (
  <>
    <li className="alinear" onClick={() => irA("/login")}>
      <VscAccount size={20} /> Registrar
    </li>
    <li className="alinear" onClick={() => irA("/logout")}>
      <ImExit size={20} /> Cerrar Sesión
    </li>
  </>
);
