// layouts/LayoutConMenu.tsx
import { Outlet } from "react-router-dom";
import { MenuNav } from "../componentes/MenuNav/MenuNav";

import "../app.css";

export const LayoutConMenu = () => {
  return (
    <div className="layout_principal">
      {/* Enlace de salto (spec 016, WCAG 2.4.1): es el primer elemento
          enfocable de la página, así que el usuario de teclado lo primero que
          encuentra al tabular. Permite saltar la barra de navegación (con sus
          secciones y desplegables) para ir directo al contenido. Oculto hasta
          que recibe foco: se ve solo al tabular. */}
      <a className="salto_contenido" href="#contenido_principal">
        Ir al contenido
      </a>

      {/* 1. La barra lateral fija */}
      <MenuNav />

      {/* 2. El contenedor que empuja el contenido a la derecha */}
      <main className="contenido_derecha" id="contenido_principal">
        <Outlet />
      </main>
    </div>
  );
};

export const LayoutSinMenu = () => {
  return (
    <>
      <Outlet />
    </>
  );
};
