import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MdOutlineDashboard } from "react-icons/md";

import { SECCIONES_USUARIO } from "../menu.config";
import { filtrarSecciones } from "../menu.permisos";
import type { TipoPlan } from "../menu.types";
import { SeccionDesplegable } from "./SeccionDesplegable";

interface Props {
  tipo?: TipoPlan | null;
  seccionAbierta: string | null;
  alternarSeccion: (clave: string) => void;
}

/**
 * Menú del usuario y del alumno.
 *
 * "Principal" es un `<Link>` (destino) — antes era un `<li onClick>` sin foco
 * (spec 014).
 *
 * @param tipo - Plan del usuario (filtra qué secciones ve).
 * @param seccionAbierta - Clave de la sección desplegada, o `null`.
 * @param alternarSeccion - Abre o cierra una sección del menú.
 */
export const VistaUsuario = ({
  tipo,
  seccionAbierta,
  alternarSeccion,
}: Props) => {
  const secciones = useMemo(
    () => filtrarSecciones(SECCIONES_USUARIO, tipo),
    [tipo],
  );

  return (
    <>
      <li className="menu-item alinear menu_principal">
        <Link className="menu_control" to="/user_manager_priv">
          <span className="menu_principal_contenido">
            <MdOutlineDashboard size={20} />
            <span>Principal</span>
          </span>
        </Link>
      </li>

      {secciones.map((seccion) => (
        <SeccionDesplegable
          key={seccion.clave}
          seccion={seccion}
          abierta={seccionAbierta === seccion.clave}
          alternar={alternarSeccion}
        />
      ))}
    </>
  );
};