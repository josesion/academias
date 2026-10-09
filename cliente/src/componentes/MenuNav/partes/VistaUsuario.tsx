import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { MdOutlineDashboard } from "react-icons/md";

import { SECCIONES_USUARIO } from "../menu.config";
import { filtrarSecciones } from "../menu.permisos";
import type { TipoPlan } from "../menu.types";
import { SeccionDesplegable } from "./SeccionDesplegable";

interface Props {
  tipo?: TipoPlan | null;
  seccionAbierta: string | null;
  alternarSeccion: (clave: string) => void;
  /** Cierra el submenú y el menú móvil: lo usan los ítems al navegar (spec 018). */
  cerrarMenu: () => void;
}

/**
 * Menú del usuario y del alumno.
 *
 * "Principal" es un `<NavLink>` (destino) — antes era un `<li onClick>` sin foco
 * (spec 014). Con `NavLink` además marca la ruta activa (spec 018).
 *
 * @param tipo - Plan del usuario (filtra qué secciones ve).
 * @param seccionAbierta - Clave de la sección desplegada, o `null`.
 * @param alternarSeccion - Abre o cierra una sección del menú.
 * @param cerrarMenu - Cierra el submenú y el menú móvil al navegar.
 */
export const VistaUsuario = ({
  tipo,
  seccionAbierta,
  alternarSeccion,
  cerrarMenu,
}: Props) => {
  const secciones = useMemo(
    () => filtrarSecciones(SECCIONES_USUARIO, tipo),
    [tipo],
  );

  return (
    <>
      <li className="menu-item alinear menu_principal">
        <NavLink
          className="menu_control"
          to="/user_manager_priv"
          onClick={cerrarMenu}
        >
          <span className="menu_principal_contenido">
            <MdOutlineDashboard size={20} />
            <span>Principal</span>
          </span>
        </NavLink>
      </li>

      {secciones.map((seccion) => (
        <SeccionDesplegable
          key={seccion.clave}
          seccion={seccion}
          abierta={seccionAbierta === seccion.clave}
          alternar={alternarSeccion}
          cerrarMenu={cerrarMenu}
        />
      ))}
    </>
  );
};