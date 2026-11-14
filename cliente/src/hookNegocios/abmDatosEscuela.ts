import { useState, useCallback, useEffect } from "react";
import { getMiEscuela, putMiEscuela, type EscuelaPerfilDatos, type EscuelaPerfilInputs } from "../servicio/escuela.perfil.fetch";
import { useNotificaciones } from "../contexto/notificaciones.context";

/**
 * Hook para cargar y guardar los datos de la escuela del usuario logueado (spec 051).
 * Solo se usa en el perfil de usuario (rol `usuario`).
 *
 * Sigue el mismo patrón que `usePerfilUsuario`: usa el `code` y `message`
 * que el backend ya ha mapeado a través de `MAPA_MODIFICAR_ESCUELA_PERFIL`.
 */
export const useAbmDatosEscuela = () => {
  const [datos, setDatos] = useState<EscuelaPerfilDatos | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const { exito: notifExito, error: notifError, info: notifInfo } = useNotificaciones();

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await getMiEscuela();
      if (res.error) {
        return;
      }
      setDatos(res.data || null);
    } catch {
      // Error silencioso al cargar; el formulario se queda vacío
    } finally {
      setCargando(false);
    }
  }, []);

  const guardar = useCallback(async (inputs: EscuelaPerfilInputs) => {
    setGuardando(true);
    try {
      const res = await putMiEscuela(inputs);

      if (res.error === false) {
        // Éxito: el backend ya mapeó el mensaje en MAPA_MODIFICAR_ESCUELA_PERFIL
        await cargar();
        notifExito(res.message || "Datos de la escuela actualizados correctamente");
        return { ok: true };
      }

      // Error: usar el código y mensaje que el backend ya ha mapeado
      const code = res.code;
      const mensaje = res.message || "Error al guardar";

      if (code === "ESCUELA_NO_ENCONTRADA") {
        notifError("No se encontró la escuela asociada a tu cuenta");
        return { ok: false, message: mensaje };
      }

      if (code === "SIN_CAMPOS") {
        notifInfo("No hay cambios para guardar");
        return { ok: false, message: mensaje };
      }

      // Errores genéricos del servidor
      notifError(mensaje);
      return { ok: false, message: mensaje };
    } catch (e: any) {
      notifError(e?.message || "Error de conexión");
      return { ok: false, message: e?.message };
    } finally {
      setGuardando(false);
    }
  }, [notifExito, notifError, notifInfo, cargar]);


  // Cargar datos al montar
  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    datos,
    cargando,
    guardando,
    cargar,
    guardar,
  };
};
