import { useEffect, useRef } from "react";

import { Logo } from "../Logo/logo";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

import { useMenuNav } from "../../hooks/navegacion";

import { VistaVisita } from "./partes/VistaVisita";
import { VistaAdministrador } from "./partes/VistaAdministrador";
import { VistaUsuario } from "./partes/VistaUsuario";
import { BloqueMiCuenta } from "./partes/BloqueMiCuenta";

import { type TipoPlan } from "./menu.types";
import "./menuNav.css";

/** `id` de la lista del menú: lo anuncia el `aria-controls` del botón de móvil. */
const ID_LISTA_MENU = "menu_nav_lista_principal";

export const MenuNav = () => {
  const {
    autenticado,
    rol,
    menuMobileAbierto,
    seccionAbierta,
    alternarSeccion,
    alternarMenuMobile,
    cerrarSesion,
    dataVisualMenu,
    setDataVisualMenu,
    setSeccionAbierta,
    setMenuMobileAbierto,
  } = useMenuNav();

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setDataVisualMenu({
      rol: rol?.rol,
      usuario: rol?.rol ? rol.usuario : null,
    });
  }, [rol]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setSeccionAbierta(null);
        setMenuMobileAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSeccionAbierta, setMenuMobileAbierto]);

  // Sin sesión no se pinta NADA del usuario logueado (red de seguridad:
  // aunque `rol` quedara con datos viejos, la barra muestra solo "visita")
  const sinSesion = !autenticado;
  const esVisitante = sinSesion || dataVisualMenu?.rol === "visita";
  const esUsuario = !sinSesion && dataVisualMenu?.rol === "usuario";
  const mostrarMiCuenta = !sinSesion && (rol?.rol === "alumno" || esUsuario);
  // console.log(rol?.tipo);
  return (
    <nav className="menu_nav" ref={navRef} aria-label="Navegación principal">
      <div className="app-name-container">
        <Logo size={60} />
        <div className="app-user-info">
          <span className="app-user-label">
            {!sinSesion && dataVisualMenu.usuario ? "Usuario" : ""}
          </span>
          <span className="app-user-name">
            {sinSesion ? "" : (dataVisualMenu.usuario ?? "")}
          </span>
        </div>
      </div>

      <ul
        className={`menu_nav_lista ${menuMobileAbierto ? "abierto" : "menu"}`}
        id={ID_LISTA_MENU}
      >
        {esVisitante && <VistaVisita />}

        {!sinSesion && rol?.rol === "administrador" && (
          <VistaAdministrador
            alternarSeccion={alternarSeccion}
            seccionAbierta={seccionAbierta}
            onLogout={cerrarSesion}
            cerrar={() => setSeccionAbierta(null)}
            usuario={dataVisualMenu.usuario ?? ""}
          />
        )}

        {esUsuario && (
          <VistaUsuario
            tipo={(rol?.tipo as TipoPlan) || "basico"}
            seccionAbierta={seccionAbierta}
            alternarSeccion={alternarSeccion}
          />
        )}

        {mostrarMiCuenta && (
          <BloqueMiCuenta
            usuario={dataVisualMenu.usuario ?? ""}
            abierto={seccionAbierta === "salir"}
            alternar={alternarSeccion}
            cerrar={() => setSeccionAbierta(null)}
            onLogout={cerrarSesion}
          />
        )}
      </ul>

      {/* Botón del menú en móvil: es un ícono solo, así que sin `aria-label`
          no tendría nombre accesible (spec 014) */}
      <button
        className="btn_menu"
        onClick={alternarMenuMobile}
        aria-expanded={menuMobileAbierto}
        aria-controls={ID_LISTA_MENU}
        aria-label={menuMobileAbierto ? "Cerrar el menú" : "Abrir el menú"}
      >
        {menuMobileAbierto ? (
          <HiChevronUp size={25} />
        ) : (
          <HiChevronDown size={25} />
        )}
      </button>
    </nav>
  );
};
