import { useMemo } from "react";
import { NavLink } from "react-router-dom";
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
  /** Cierra el submenú y el menú móvil: lo usan los ítems al navegar (spec 018). */
  cerrarMenu: () => void;
  cerrar: () => void;
  onLogout: () => void;
}

/**
 * Menú del administrador.
 *
 * "Panel Admin" es un `<NavLink>` (destino) y "Mi Cuenta" un `<button
 * aria-expanded>` (despliega) — antes ambos eran `<li onClick>` sin foco
 * (spec 014). Con `NavLink` además marca la ruta activa (spec 018).
 *
 * @param usuario - Nombre del usuario que se muestra en el bloque Mi Cuenta.
 * @param tipo - Plan del administrador (filtra qué secciones ve).
 * @param seccionAbierta - Clave de la sección desplegada, o `null`.
 * @param alternarSeccion - Abre o cierra una sección del menú.
 * @param cerrarMenu - Cierra el submenú y el menú móvil al navegar.
 * @param cerrar - Cierra el bloque de Mi Cuenta.
 * @param onLogout - Cierra la sesión.
 */
export const VistaAdministrador = ({
  usuario,
  tipo,
  seccionAbierta,
  alternarSeccion,
  cerrarMenu,
  cerrar,
  onLogout,
}: Props) => {
  const secciones = useMemo(
    () => filtrarSecciones(SECCIONES_ADMINISTRADOR, tipo),
    [tipo],
  );

  const idMiCuenta = "menu_usuario_admin";

  return (
    <>
      {/* Botón principal del Panel Admin */}
      <li className="menu-item alinear menu_principal">
        <NavLink
          className="menu_control"
          to="/assistant_manager_priv"
          onClick={cerrarMenu}
        >
          <span className="menu_principal_contenido">
            <MdOutlineDashboard size={20} color="#34d399" />
            <span>Panel Admin</span>
          </span>
        </NavLink>
      </li>

      {/* Secciones desplegables (Escuelas, Planes SaaS, Usuarios, Empresas y Anuncios) */}
      {secciones.map((seccion) => (
        <SeccionDesplegable
          key={seccion.clave}
          seccion={seccion}
          abierta={seccionAbierta === seccion.clave}
          alternar={alternarSeccion}
          cerrarMenu={cerrarMenu}
        />
      ))}

      {/* Bloque de salida / Mi Cuenta del Administrador usando MenuUsuario */}
      <li className="alinear">
        <button
          type="button"
          className="menu_control"
          onClick={() => alternarSeccion("salir")}
          aria-expanded={seccionAbierta === "salir"}
          aria-controls={idMiCuenta}
        >
          <ImExit size={20} color="#796d6d" />
          Mi Cuenta
        </button>
      </li>

      {seccionAbierta === "salir" && (
        <MenuUsuario
          id={idMiCuenta}
          usuario={usuario}
          onCerrar={cerrar}
          onLogout={onLogout}
        />
      )}
    </>
  );
};