import {
  type ReactNode,
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { apiFetch } from "../utils/apiFetch";
import { PAGINA } from "../servicio/variables.globales";

interface AuthContextType {
  autenticado: boolean;
  setAutenticado: (value: boolean) => void;

  usuarioInfo: UsuarioInfo | null;
  setUsuarioInfo: (value: UsuarioInfo | null) => void;

  rol: UsuarioEscuelaInfo | null;
  setRol: (value: UsuarioEscuelaInfo | null) => void;

  /** Limpieza ÚNICA de la sesión: `autenticado`, `usuarioInfo`, `rol`,
   *  el `localStorage` y la cookie `token`. La usan el logout manual, el
   *  verify fallido y el chequeo periódico del token. */
  cerrarSesion: () => void;
}

interface ProtectRutasProvProps {
  children: ReactNode;
}

type UsuarioInfo = {
  usuario: string;
  error: boolean;
};

type UsuarioEscuelaInfo = {
  rol: string;
  usuario: string;
  razon_social: string;
  /** Rubro de la escuela (`baile` | `gym`). Spec 047. */
  rubro: string;
  tipo: string;
  /** `null` cuando la escuela todavía no tiene ninguna suscripción en la BD */
  estado_suscripcion: string | null;
};

/** Estado "sin sesión": lo único que puede pintar la barra de navegación
 *  cuando nadie está logueado. Sin `export` para no romper el fast refresh
 *  del archivo (ojo: `usuario` va `""`, no `"visita"` — con "visita" la
 *  barra publica "Usuario: visita"). */
const ROL_VISITA: UsuarioEscuelaInfo = {
  rol: "visita",
  usuario: "",
  razon_social: "",
  rubro: "baile",
  tipo: "basico",
  estado_suscripcion: null,
};

export const RutasProtegidasContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

/**
 * Aplica o retira el tema de rubro en el elemento `<html>`.
 *
 * El atributo `data-rubro="gym"` activa el bloque de tokens de `app.css`
 * (spec 047). **No** se aplica al rol `administrador`: ese usuario pertenece a
 * la plataforma y no a un tenant, así que queda con la estética neutral.
 *
 * Se define acá (y no se exporta) para no romper la regla
 * `react-refresh/only-export-components` de Vite.
 *
 * @param rubro - Rubro de la escuela de la sesión (`baile` | `gym`).
 * @param rol - Rol del usuario autenticado.
 */
const aplicarRubroEnDocumento = (
  rubro?: string | null,
  rol?: string | null,
): void => {
  const raiz = document.documentElement;

  if (rol !== "administrador" && rubro === "gym") {
    raiz.setAttribute("data-rubro", "gym");
    return;
  }

  raiz.removeAttribute("data-rubro");
};

export const ProtectRutasProv = ({ children }: ProtectRutasProvProps) => {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuarioInfo, setUsuarioInfo] = useState<UsuarioInfo | null>(null);

  // SIN rehidratación desde localStorage: el estado arranca siempre en
  // "visita" para que la barra nunca se pinte con datos de una sesión
  // vieja (el token se re-verifica en Rutas.Protegidas).
  const [rol, setRol] = useState<UsuarioEscuelaInfo | null>(ROL_VISITA);

  const [usuarioEscuela, setUsuarioEscuela] =
    useState<UsuarioEscuelaInfo | null>(null);

  // El tema de rubro sigue a la sesión (spec 047): se aplica al loguearse y se
  // retira al cerrar sesión (el estado vuelve a ROL_VISITA, que es `baile`).
  useEffect(() => {
    aplicarRubroEnDocumento(rol?.rubro, rol?.rol);
  }, [rol?.rubro, rol?.rol]);

  /**
   * Limpieza única del cierre de sesión: sirve tanto para el logout manual
   * como para cuando el server responde 401/403 (token vencido).
   * Dispara POST /api/logout (fire-and-forget) y limpia estado local INMEDIATO
   * sin await → evita race condition en prod (latencia de red).
   */
  const cerrarSesion = useCallback(() => {
    // Fire-and-forget: dispara request al server (borra cookie httpOnly)
    // NO await → no bloquea limpieza local ni navegación
    apiFetch(`${PAGINA}api/logout`, { method: "POST" }).catch(() => {});

    // Limpieza local INMEDIATA (síncrona)
    setAutenticado(false);
    setUsuarioInfo(null);
    setRol(ROL_VISITA);
    // El tema de rubro es parte de la sesión: se retira al cerrarla (spec 047).
    aplicarRubroEnDocumento(null, null);
    // Basura de versiones anteriores: ya no se persiste el rol
    localStorage.removeItem("usuarioEscuela");
    // `Cookies.remove` NO puede borrar la cookie `token` real: es `httpOnly`
    // (server: `crearCookie()` → `jwt.ts`) y el JS no la ve. Se deja igual por
    // compatibilidad; el logout real lo hace el server con `clearCookie`.
    Cookies.remove("token");
  }, []);

  useEffect(() => {
    // Limpieza legacy: en versiones viejas este ítem guardaba el rol
    localStorage.removeItem("usuarioEscuela");
  }, []);

  const contextValue = {
    autenticado,
    setAutenticado,
    usuarioInfo,
    setUsuarioInfo,
    rol,
    setRol,
    cerrarSesion,
    usuarioEscuela,
    setUsuarioEscuela,
  };

  return (
    <RutasProtegidasContext.Provider value={contextValue}>
      {children}
    </RutasProtegidasContext.Provider>
  );
};

export default ProtectRutasProv;
