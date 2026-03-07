// layouts/LayoutConMenu.tsx
import { Outlet } from "react-router-dom";
import { MenuNav } from "../componentes/MenuNav/MenuNav";

export const LayoutConMenu = () => {
  return (
    <div className="layout_principal">
      {/* 1. La barra lateral fija */}
      <MenuNav />

      {/* 2. El contenedor que empuja el contenido a la derecha */}
      <main className="contenido_derecha">
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
