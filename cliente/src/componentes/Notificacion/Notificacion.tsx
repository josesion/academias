import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type {
  ItemNotificacion,
  TipoNotificacion,
} from "../../contexto/notificaciones.context";

interface NotificacionProps extends ItemNotificacion {
  onCerrar: (id: string) => void;
}

const ETIQUETAS: Record<TipoNotificacion, string> = {
  exito: "Listo",
  error: "Error",
  info: "Aviso",
};

const ICONOS: Record<TipoNotificacion, ReactNode> = {
  exito: <polyline points="6 12.5 10.5 17 18.5 8" />,
  error: (
    <>
      <line x1="12" y1="7" x2="12" y2="13" />
      <circle cx="12" cy="16.8" r="0.6" fill="currentColor" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="7.5" r="0.6" fill="currentColor" />
      <line x1="12" y1="11" x2="12" y2="17" />
    </>
  ),
};

export const Notificacion = ({
  id,
  tipo,
  mensaje,
  titulo,
  duracion,
  saliendo,
  onCerrar,
}: NotificacionProps) => {
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const [segundoPlano, setSegundoPlano] = useState(() => document.hidden);

  const pausado = hover || foco || segundoPlano;
  const restante = useRef(duracion);
  const inicio = useRef(0);

  // Pestaña en segundo plano: pausa el reloj
  useEffect(() => {
    const alCambiar = () => setSegundoPlano(document.hidden);
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, []);

  // Temporizador con pausa: al pausar descuenta lo transcurrido y al reanudar sigue desde ahí.
  useEffect(() => {
    if (duracion <= 0 || saliendo || pausado) return;
    inicio.current = Date.now();
    const temporizador = window.setTimeout(
      () => onCerrar(id),
      restante.current,
    );
    return () => {
      window.clearTimeout(temporizador);
      restante.current -= Date.now() - inicio.current;
    };
  }, [pausado, duracion, saliendo, id, onCerrar]);

  return (
    <div
      className="notificacion"
      data-tipo={tipo}
      data-saliendo={saliendo || undefined}
      // alert interrumpe y se anuncia de inmediato; status espera su turno
      role={tipo === "error" ? "alert" : "status"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFoco(true)}
      onBlur={() => setFoco(false)}
    >
      <div className="notificacion_marca" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICONOS[tipo]}
        </svg>
      </div>

      <div className="notificacion_cuerpo">
        <span className="notificacion_titulo">{titulo ?? ETIQUETAS[tipo]}</span>
        <p className="notificacion_mensaje">{mensaje}</p>
      </div>

      <button
        type="button"
        className="notificacion_cerrar"
        aria-label="Cerrar notificación"
        onClick={() => onCerrar(id)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>

      {duracion > 0 && (
        <span
          className="notificacion_barra"
          data-pausado={pausado || undefined}
          style={{ animationDuration: `${duracion}ms` } as CSSProperties}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
