import { useEffect, useRef, useState } from "react";
import {
  LuMenu,
  LuX,
  LuCalendarClock,
  LuCreditCard,
  LuLogOut,
} from "react-icons/lu";

import "./menudesplegable.css";

export const MenuDesplegableAlumno = () => {
  const [abierto, setAbierto] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const alternarMenu = () => setAbierto((prev) => !prev);
  const cerrarMenu = () => setAbierto(false);

  useEffect(() => {
    const handleClickAfuera = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    };

    if (abierto) {
      document.addEventListener("mousedown", handleClickAfuera);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAfuera);
    };
  }, [abierto]);

  return (
    <>
      <button
        className="menu_alumno_trigger"
        type="button"
        onClick={alternarMenu}
        aria-label="Abrir menú"
      >
        <LuMenu size={22} />
      </button>

      {abierto && <div className="menu_alumno_overlay" />}

      <div
        ref={panelRef}
        className={`menu_alumno_panel ${abierto ? "abierto" : ""}`}
      >
        <div className="menu_alumno_header">
          <span className="menu_alumno_header_titulo">Menú</span>
          <button
            className="menu_alumno_btn_cerrar"
            type="button"
            onClick={cerrarMenu}
            aria-label="Cerrar menú"
          >
            <LuX size={20} />
          </button>
        </div>

        <nav className="menu_alumno_lista">
          <button
            className="menu_alumno_item"
            type="button"
            onClick={cerrarMenu}
          >
            <LuCalendarClock size={18} />
            <span>Horarios</span>
          </button>

          <button
            className="menu_alumno_item"
            type="button"
            onClick={cerrarMenu}
          >
            <LuCreditCard size={18} />
            <span>Planes</span>
          </button>
        </nav>

        <div className="menu_alumno_footer">
          <button className="menu_alumno_item salir" type="button">
            <LuLogOut size={18} />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </>
  );
};
