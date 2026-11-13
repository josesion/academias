// useMenuNav.ts
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RutasProtegidasContext } from "../contexto/protectRutas";

export const useMenuNav = () => {
  const navegar = useNavigate();
  const { autenticado, rol, cerrarSesion: cerrarSesionContexto } =
    useContext(RutasProtegidasContext);
 
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
    setSeccionAbierta(seccionAbierta === nombre ? null : nombre);
  };

  /**
   * Cierra el menú SIN navegar (spec 018).
   *
   * Es lo que se pone en el `onClick` de los ítems, que son `<NavLink>`: la
   * navegación la hace el propio enlace, así que acá solo hace falta cerrar.
   *
   * Antes de esto la cierre lo hacía `irA`, pero la spec 014 convirtió los
   * `<li onClick>` en `<Link>` puros (para que fueran enfocables y anunciables
   * como enlaces) y `irA` quedó sin un solo llamador: al hacer click en un ítem
   * el submenú y el menú móvil seguían abiertos.
   *
   * No se puede resolver con el "click fuera" de `MenuNav`: compara contra
   * `navRef` y los ítems están DENTRO del `<nav>`, así que nunca cuentan como
   * click externo.
   */
  const cerrarMenu = () => {
    setMenuMobileAbierto(false);
    setSeccionAbierta(null);
  };

  /**
   * Función centralizada para navegar.
   * Al cambiar de página, asegura que el menú mobile se cierre.
   *
   * @deprecated Los ítems son `<NavLink>` y usan `cerrarMenu` en su `onClick`.
   * Se conserva para navegación programática (por ejemplo desde un `navigate`
   * que no pasa por el menú).
   */
  const irA = (ruta: string) => {
    navegar(ruta);
    cerrarMenu();
  };

  const alternarMenuMobile = () => {
    setMenuMobileAbierto(!menuMobileAbierto);
  };
  
    /**
     * Logout MANUAL: solo acomoda el menú/local y delega la limpieza real
     * de la sesión en el contexto (`cerrarSesion`: rol, autenticado,
     * usuario, localStorage y cookie). Un solo camino para los 2 casos:
     * logout manual y token vencido.
     */
  const cerrarSesion = ()=>{
    cerrarMenu();
    setDataVisualMenu({ rol : "visita", usuario :  null });
    cerrarSesionContexto();
    navegar("/login");
  };

  

  return {
    autenticado,
    rol,
    menuMobileAbierto,
    seccionAbierta,
    alternarSeccion,
    alternarMenuMobile,
    irA,
    cerrarMenu,
    cerrarSesion,
    dataVisualMenu,
    setDataVisualMenu,
    setSeccionAbierta,
    setMenuMobileAbierto
  };
};