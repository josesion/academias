import {
  type ReactNode,
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";

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
  tipo: "basico",
  estado_suscripcion: null,
};

export const RutasProtegidasContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const ProtectRutasProv = ({ children }: ProtectRutasProvProps) => {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuarioInfo, setUsuarioInfo] = useState<UsuarioInfo | null>(null);

  // SIN rehidratación desde localStorage: el estado arranca siempre en
  // "visita" para que la barra nunca se pinte con datos de una sesión
  // vieja (el token se re-verifica en Rutas.Protegidas).
  const [rol, setRol] = useState<UsuarioEscuelaInfo | null>(ROL_VISITA);

  const [usuarioEscuela, setUsuarioEscuela] =
    useState<UsuarioEscuelaInfo | null>(null);

  /**
   * Limpieza única del cierre de sesión: sirve tanto para el logout manual
   * como para cuando el server responde 401/403 (token vencido).
   */
  const cerrarSesion = useCallback(() => {
    setAutenticado(false);
    setUsuarioInfo(null);
    setRol(ROL_VISITA);
    // Basura de versiones anteriores: ya no se persiste el rol
    localStorage.removeItem("usuarioEscuela");
    // `Cookies.remove` NO puede borrar la cookie `token` real: es `httpOnly`
    // (server: `crearCookie()` → `jwt.ts`) y el JS no la ve. Se deja igual por
    // compatibilidad; el logout completo depende de un endpoint del server con
    // `res.clearCookie` (pendiente de decidir).
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
