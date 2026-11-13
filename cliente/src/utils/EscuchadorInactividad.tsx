import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RutasProtegidasContext } from "../contexto/protectRutas";
import { useNotificaciones } from "../contexto/notificaciones.context";

/** Tiempo máximo sin actividad antes de cerrar sesión (15 minutos). */
const TIEMPO_LIMITE_INACTIVIDAD = 15 * 60 * 1000;
/** Intervalo de verificación periódica (red de seguridad). */
const INTERVALO_REVISION = 10 * 1000;
/** Clave de localStorage compartida entre pestañas para el último timestamp. */
const CLAVE_TIMESTAMP = "ultimo_timestamp";

/**
 * Cierra la sesión por inactividad del usuario autenticado.
 * Usa `localStorage` para coordinar pestañas y evita expiración inmediata
 * por un timestamp viejo al activar una sesión nueva.
 *
 * @returns {null} No renderiza UI.
 */
export function EscuchadorInactividad() {
  const { autenticado, cerrarSesion } = useContext(RutasProtegidasContext);
  const { info } = useNotificaciones();
  const navigate = useNavigate();

  // Siempre apunta a las últimas versiones, sin re-disparar el efecto.
  const accionesRef = useRef({ cerrarSesion, info, navigate });
  accionesRef.current = { cerrarSesion, info, navigate };

  useEffect(() => {
    if (!autenticado) return;

    /**
     * Indica si el timestamp guardado supera el límite de inactividad.
     * @returns {boolean} `true` si expiró.
     */
    const haExpirado = (): boolean => {
      const ultimo = localStorage.getItem(CLAVE_TIMESTAMP);
      return (
        ultimo !== null &&
        Date.now() - Number(ultimo) > TIEMPO_LIMITE_INACTIVIDAD
      );
    };

    /**
     * Cierra sesión por inactividad y redirige al login.
     */
    const cerrarPorInactividad = () => {
      const { cerrarSesion: cerrar, info: notificarInfo, navigate: ir } =
        accionesRef.current;
      localStorage.removeItem(CLAVE_TIMESTAMP);
      cerrar();
      notificarInfo("Tu sesión se cerró por inactividad.");
      ir("/login", { replace: true });
    };

    /**
     * Ante interacción/visibilidad: si expiró cierra; si no, renueva timestamp.
     */
    const verificarYActualizar = () => {
      if (haExpirado()) {
        cerrarPorInactividad();
        return;
      }
      localStorage.setItem(CLAVE_TIMESTAMP, Date.now().toString());
    };

    /**
     * Revisión periódica sin renovar (no es actividad del usuario).
     */
    const revisarSolo = () => {
      if (haExpirado()) cerrarPorInactividad();
    };

    /**
     * Al volver a la pestaña, verifica y actualiza si corresponde.
     */
    const manejarVisibilidad = () => {
      if (document.visibilityState === "visible") verificarYActualizar();
    };

    // Normaliza al activar: evita cierre inmediato por timestamp viejo de una
    // sesión anterior; si ya expiró según ese timestamp, se reinicia la marca.
    if (haExpirado()) {
      localStorage.setItem(CLAVE_TIMESTAMP, Date.now().toString());
    } else {
      verificarYActualizar();
    }

    const eventosWindow = [
      "click",
      "keydown",
      "touchstart",
      "focus",
      "pageshow",
    ] as const;
    eventosWindow.forEach((e) =>
      window.addEventListener(e, verificarYActualizar),
    );
    document.addEventListener("visibilitychange", manejarVisibilidad);

    // Red de seguridad: detecta expiración aunque no llegue ningún evento.
    const intervalo = window.setInterval(revisarSolo, INTERVALO_REVISION);

    return () => {
      eventosWindow.forEach((e) =>
        window.removeEventListener(e, verificarYActualizar),
      );
      document.removeEventListener("visibilitychange", manejarVisibilidad);
      window.clearInterval(intervalo);
    };
  }, [autenticado]);

  return null;
}
