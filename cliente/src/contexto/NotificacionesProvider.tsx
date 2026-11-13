import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Notificacion } from "../componentes/Notificacion/Notificacion";
import { NotificacionesContext } from "./notificaciones.context";
import type {
  ApiNotificaciones,
  ItemNotificacion,
  OpcionesNotificacion,
  TipoNotificacion,
} from "./notificaciones.context";
import "../componentes/Notificacion/notificaciones.css";

const DURACION_POR_TIPO: Record<TipoNotificacion, number> = {
  exito: 4000,
  info: 5000,
  error: 8000, // los errores se leen más lento y no conviene que se escapen
};
const MAX_VISIBLES = 4;
const TIEMPO_SALIDA = 250; // igual a la animación de salida en el CSS

export const NotificacionesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [items, setItems] = useState<ItemNotificacion[]>([]);
  const contador = useRef(0);

  const quitar = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Primero marca "saliendo" (corre la animación) y después la quita del DOM.
  const cerrar = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, saliendo: true } : i)),
      );
      window.setTimeout(() => quitar(id), TIEMPO_SALIDA);
    },
    [quitar],
  );

  const notificar = useCallback((opciones: OpcionesNotificacion) => {
    const tipo = opciones.tipo ?? "info";
    const id = `notificacion-${++contador.current}`;
    const item: ItemNotificacion = {
      id,
      tipo,
      mensaje: opciones.mensaje,
      titulo: opciones.titulo,
      duracion: opciones.duracion ?? DURACION_POR_TIPO[tipo],
    };
    setItems((prev) => [...prev, item].slice(-MAX_VISIBLES));
    return id;
  }, []);

  const api = useMemo<ApiNotificaciones>(
    () => ({
      notificar,
      cerrar,
      exito: (mensaje, extra) =>
        notificar({ ...extra, mensaje, tipo: "exito" }),
      error: (mensaje, extra) =>
        notificar({ ...extra, mensaje, tipo: "error" }),
      info: (mensaje, extra) => notificar({ ...extra, mensaje, tipo: "info" }),
    }),
    [notificar, cerrar],
  );

  return (
    <NotificacionesContext.Provider value={api}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="notificaciones">
            {items.map((item) => (
              <Notificacion key={item.id} {...item} onCerrar={cerrar} />
            ))}
          </div>,
          document.body,
        )}
    </NotificacionesContext.Provider>
  );
};
