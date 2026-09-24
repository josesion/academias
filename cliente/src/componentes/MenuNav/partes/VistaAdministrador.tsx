import { useMemo } from "react";
import { MdOutlineDashboard } from "react-icons/md";
import { ImExit } from "react-icons/im";

import { SECCIONES_ADMINISTRADOR } from "../menu.config";
import { filtrarSecciones } from "../menu.permisos";
import type { TipoPlan } from "../menu.types";
import { SeccionDesplegable } from "./SeccionDesplegable";
import { MenuUsuario } from "../../Logout/Logout";

interface Props {
  usuario: string;
  tipo?: TipoPlan | null;
  seccionAbierta: string | null;
  alternarSeccion: (clave: string) => void;
  cerrar: () => void;
  irA: (ruta: string) => void;
  onLogout: () => void;
}

export const VistaAdministrador = ({
  usuario,
  tipo,
  seccionAbierta,
  alternarSeccion,
  cerrar,
  irA,
  onLogout,
}: Props) => {
  const secciones = useMemo(
    () => filtrarSecciones(SECCIONES_ADMINISTRADOR, tipo),
    [tipo],
  );

  return (
    <>
      {/* Botón principal del Panel Admin */}
      <li
        className="menu-item alinear menu_principal"
        onClick={() => irA("/assistant_manager_priv")}
      >
        <div className="menu_principal_contenido">
          <MdOutlineDashboard size={20} color="#34d399" />
          <span>Panel Admin</span>
        </div>
      </li>

      {/* Secciones desplegables (Escuelas y Planes SaaS) */}
      {secciones.map((seccion) => (
        <SeccionDesplegable
          key={seccion.clave}
          seccion={seccion}
          abierta={seccionAbierta === seccion.clave}
          alternar={alternarSeccion}
          irA={irA}
        />
      ))}

      {/* Bloque de salida / Mi Cuenta del Administrador usando MenuUsuario */}
      <li className="alinear" onClick={() => alternarSeccion("salir")}>
        <ImExit size={20} color="#796d6d" />
        Mi Cuenta
      </li>

      {seccionAbierta === "salir" && (
        <MenuUsuario usuario={usuario} onCerrar={cerrar} onLogout={onLogout} />
      )}
    </>
  );
};
