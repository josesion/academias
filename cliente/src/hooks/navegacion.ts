// useMenuNav.ts
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RutasProtegidasContext } from "../contexto/protectRutas";

import { verificarAutenticacion } from "../hooks/verificacionUsuario";

import Cookies from "js-cookie";

export const useMenuNav = () => {
  const navegar = useNavigate();
  const { rol, setRol } = useContext(RutasProtegidasContext);
 
  // Estado para el menú en dispositivos móviles (abierto/cerrado)
  const  [menuMobileAbierto, setMenuMobileAbierto] = useState<boolean>(false);


  // Estado para el acordeón: guarda el nombre de la sección desplegada (ej: 'operaciones')
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);

  type Rol = { rol : "visita" | "usuario" }

  interface DataVisual{
    rol : Rol | any,
    usuario : string | null
  };

    /**
    * Sirve para colocar y podes actulizar la parte visual del nombre del usuario 
    */
  const [ dataVisualMenu, setDataVisualMenu] = useState<DataVisual>({ rol : rol?.rol  , usuario : rol?.usuario ? rol.usuario : null });
  

  /**
   * Cambia el estado de una sección del menú.
   * Si la sección ya está abierta, la cierra. Si no, abre la nueva y cierra la anterior.
   */
  const alternarSeccion = async (nombre: string) => {
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        window.location.href = "/login" // por defecto en esta app es login
        return;
    };
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
  
    /**
   *  Funcion para lograr eliminar el token y mandar al login eliminado los permisos
   */
  const cerrarSesion = ()=>{
    Cookies.remove("token");
    setMenuMobileAbierto(false);
    setDataVisualMenu({ rol : "visita", usuario :  null });
    setRol({rol : "visita", usuario :  ""})
    setSeccionAbierta(null);;
    navegar("/login");

  };

  return {
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
  };
};