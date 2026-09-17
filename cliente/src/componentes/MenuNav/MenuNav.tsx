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

export const MenuNav = () => {
  const {
    rol,
    menuMobileAbierto,
    seccionAbierta,
    alternarSeccion,
    alternarMenuMobile,
    irA,
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

  const esUsuario = dataVisualMenu?.rol === "usuario";
  const mostrarMiCuenta = rol?.rol === "alumno" || esUsuario;

  console.log(rol);

  return (
    <nav className="menu_nav" ref={navRef}>
      <div className="app-name-container">
        <Logo size={60} />
        <div className="app-user-info">
          <span className="app-user-label">
            {dataVisualMenu.usuario ? "Usuario" : ""}
          </span>
          <span className="app-user-name">{dataVisualMenu.usuario ?? ""}</span>
        </div>
      </div>

      <ul
        className={`menu_nav_lista ${menuMobileAbierto ? "abierto" : "menu"}`}
      >
        {dataVisualMenu?.rol === "visita" && <VistaVisita irA={irA} />}

        {rol?.rol === "administrador" && <VistaAdministrador irA={irA} />}

        {esUsuario && (
          <VistaUsuario
            tipo={(rol?.tipo as TipoPlan) || "basico"}
            seccionAbierta={seccionAbierta}
            alternarSeccion={alternarSeccion}
            irA={irA}
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

      <button className="btn_menu" onClick={alternarMenuMobile}>
        {menuMobileAbierto ? (
          <HiChevronUp size={25} />
        ) : (
          <HiChevronDown size={25} />
        )}
      </button>
    </nav>
  );
};
