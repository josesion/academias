import { useCallback, useEffect, useRef, useState } from "react";
import { verificarDisponibilidadUsuario } from "../../servicio/registro.gratuito/registro.gratuito.fetch";

export type EstadoDisponibilidad = "sin_verificar" | "verificando" | "disponible" | "no_disponible";

export const useDisponibilidadUsuario = (usuario: string, delay = 400) => {
  const [estado, setEstado] = useState<EstadoDisponibilidad>("sin_verificar");
  const [mensaje, setMensaje] = useState<string>("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setEstado("sin_verificar");
    setMensaje("");
  }, []);

  const verificar = useCallback(
    (valor: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }

      if (!valor || valor.trim().length === 0) {
        setEstado("sin_verificar");
        setMensaje("");
        return;
      }

      setEstado("verificando");
      setMensaje("Verificando disponibilidad...");

      timeoutRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;
        try {
          const res = await verificarDisponibilidadUsuario(valor.trim(), controller.signal);
          if (controller.signal.aborted) return;
          if (res.error) {
            setEstado("sin_verificar");
            setMensaje("");
            return;
          }
          if (res.data.disponible) {
            setEstado("disponible");
            setMensaje("Usuario disponible");
          } else {
            setEstado("no_disponible");
            setMensaje("El usuario ya existe");
          }
        } catch {
          if (controller.signal.aborted) return;
          setEstado("sin_verificar");
          setMensaje("");
        } finally {
          abortRef.current = null;
        }
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    verificar(usuario);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [usuario, verificar]);

  return { estado, mensaje, reset };
};
