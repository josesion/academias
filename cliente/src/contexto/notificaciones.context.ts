import { createContext, useContext } from "react";

export type TipoNotificacion = "exito" | "error" | "info";

export interface OpcionesNotificacion {
  /** Por defecto "info". */
  tipo?: TipoNotificacion;
  mensaje: string;
  /** Etiqueta chica sobre el mensaje. Por defecto según el tipo. */
  titulo?: string;
  /** Milisegundos hasta que se cierra sola. 0 = no se cierra sola. */
  duracion?: number;
}

type OpcionesExtra = Omit<OpcionesNotificacion, "mensaje" | "tipo">;

export interface ItemNotificacion {
  id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  titulo?: string;
  duracion: number;
  saliendo?: boolean;
}

export interface ApiNotificaciones {
  /** Devuelve el id, por si querés cerrarla a mano con `cerrar(id)`. */
  notificar: (opciones: OpcionesNotificacion) => string;
  exito: (mensaje: string, opciones?: OpcionesExtra) => string;
  error: (mensaje: string, opciones?: OpcionesExtra) => string;
  info: (mensaje: string, opciones?: OpcionesExtra) => string;
  cerrar: (id: string) => void;
}

export const NotificacionesContext = createContext<ApiNotificaciones | null>(
  null,
);

export function useNotificaciones(): ApiNotificaciones {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) {
    throw new Error(
      "useNotificaciones debe usarse dentro de <NotificacionesProvider>",
    );
  }
  return ctx;
}
