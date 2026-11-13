import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RutasProtegidasContext } from "../contexto/protectRutas";
import { useNotificaciones } from "../contexto/notificaciones.context";

/**
 * Escucha el evento global `sesion-expirada` y, si hay sesión activa,
 * cierra la sesión local, muestra un toast de error y navega al login.
 *
 * R1=A (spec 052): nadie despacha `sesion-expirada` actualmente; el
 * escuchador queda preparado para cuando algún flujo lo emita.
 *
 * @returns {null} No renderiza UI.
 */
export function EscuchadorSesionExpirada() {
  const { autenticado, cerrarSesion } = useContext(RutasProtegidasContext);
  const { error } = useNotificaciones();
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Maneja la expiración de sesión disparada externamente.
     */
    const handleSesionExpirada = () => {
      if (!autenticado) return;
      cerrarSesion();
      error("Tu sesión expiró. Volvé a iniciar sesión.");
      navigate("/login", { replace: true });
    };

    window.addEventListener("sesion-expirada", handleSesionExpirada);

    return () => {
      window.removeEventListener("sesion-expirada", handleSesionExpirada);
    };
  }, [autenticado, cerrarSesion, error, navigate]);

  return null;
}
