// layouts/LayoutConMenu.tsx
import { Outlet } from "react-router-dom";
import { MenuNav } from "../componentes/MenuNav/MenuNav";

export const LayoutConMenu = () => {
  return (
    <>
      <MenuNav />
      <Outlet />
    </>
  );
};

export const LayoutSinMenu = () => {
  return (
    <>
      <Outlet />
    </>
  );
};
