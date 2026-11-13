import { useState, useCallback } from "react";
import { registrarEscuelaGratuita, type RegistroGratuitoDatos } from "../../servicio/registro.gratuito/registro.gratuito.fetch";
import { useNotificaciones } from "../../contexto/notificaciones.context";

export const useRegistroGratuito = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>("");
  const [exito, setExito] = useState(false);
  const { exito: notifExito, error: notifError, info: notifInfo } = useNotificaciones();
  const registrar = useCallback(async (datos: RegistroGratuitoDatos) => {
    setCargando(true);
    setError("");
    setExito(false);
    try {
      const res = await registrarEscuelaGratuita(datos);
      if (res.error) {
        setError(res.message || "Error al registrar");
        notifInfo(res.message || "Error al registrar");
        return { ok: false, message: res.message };
      }
      setExito(true);
      notifExito("Registro exitoso. Verficar correo electrónico para ver los datos de su cuenta.");
      return { ok: true, data: res.data };
    } catch (e: any) {
      setError(e?.message || "Error al registrar");
      notifError(e?.message || "Error al registrar");
      return { ok: false, message: e?.message };
    } finally {
      setCargando(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCargando(false);
    setError("");
    setExito(false);
  }, []);

  return { registrar, cargando, error, exito, reset };
};
