import { useMemo } from "react";
import { MdOutlineDashboard } from "react-icons/md";

import { SECCIONES_USUARIO } from "../menu.config";
import { filtrarSecciones } from "../menu.permisos";
import type { TipoPlan } from "../menu.types";
import { SeccionDesplegable } from "./SeccionDesplegable";

interface Props {
  tipo?: TipoPlan | null;
  seccionAbierta: string | null;
  alternarSeccion: (clave: string) => void;
  irA: (ruta: string) => void;
}

export const VistaUsuario = ({
  tipo,
  seccionAbierta,
  alternarSeccion,
  irA,
}: Props) => {
  const secciones = useMemo(
    () => filtrarSecciones(SECCIONES_USUARIO, tipo),
    [tipo],
  );

  return (
    <>
      <li
        className="menu-item alinear menu_principal"
        onClick={() => irA("/user_manager_priv")}
      >
        <div className="menu_principal_contenido">
          <MdOutlineDashboard size={20} />
          <span>Principal</span>
        </div>
      </li>

      {secciones.map((seccion) => (
        <SeccionDesplegable
          key={seccion.clave}
          seccion={seccion}
          abierta={seccionAbierta === seccion.clave}
          alternar={alternarSeccion}
          irA={irA}
        />
      ))}
    </>
  );
};
