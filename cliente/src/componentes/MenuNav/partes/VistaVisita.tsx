import { GiBlackBook } from "react-icons/gi";
import { VscAccount } from "react-icons/vsc";

interface Props {
  irA: (ruta: string) => void;
}

export const VistaVisita = ({ irA }: Props) => (
  <>
    <li className="alinear" onClick={() => irA("/")}>
      <GiBlackBook size={20} /> Inicio
    </li>
    <li className="alinear" onClick={() => irA("/login")}>
      <VscAccount size={20} /> Login
    </li>
  </>
);
