// useMenuNav.ts
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RutasProtegidasContext } from "../contexto/protectRutas";

export const useMenuNav = () => {
  const navegar = useNavigate();
  const { rol } = useContext(RutasProtegidasContext);

  // Estado para el menú en dispositivos móviles (abierto/cerrado)
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false);
  
  // Estado para el acordeón: guarda el nombre de la sección desplegada (ej: 'operaciones')
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);

  /**
   * Cambia el estado de una sección del menú.
   * Si la sección ya está abierta, la cierra. Si no, abre la nueva y cierra la anterior.
   */
  const alternarSeccion = (nombre: string) => {
    setSeccionAbierta(seccionAbierta === nombre ? null : nombre);
  };

  /**
   * Función centralizada para navegar.
   * Al cambiar de página, asegura que el menú mobile se cierre.
   */
  const irA = (ruta: string) => {
    navegar(ruta);
    setMenuMobileAbierto(false); 
    setSeccionAbierta(null);
  };

  const alternarMenuMobile = () => {
    setMenuMobileAbierto(!menuMobileAbierto);
  };

  return {
    rol,
    menuMobileAbierto,
    seccionAbierta,
    alternarSeccion,
    alternarMenuMobile,
    irA
  };
};