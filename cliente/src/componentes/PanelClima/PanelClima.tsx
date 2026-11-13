import { useState } from "react";
import { Droplets, Thermometer, Wind, X } from "lucide-react";

import "./panelClima.css";

import { useClimaSalta } from "../../hooks/usuario/useClimaSalta";
import type { TipoCondicionClima } from "../../tipadosTs/clima.typado";
import {
  IMAGEN_CLIMA_RESPALDO,
  UBICACION_CLIMA,
  imagenDeCondicion,
} from "../../servicio/clima.fetch";

/** Texto visible de cada condición climática. */
const TEXTO_CONDICION: Record<TipoCondicionClima, string> = {
  despejado: "Despejado",
  parcial: "Parcialmente nublado",
  nublado: "Nublado",
  niebla: "Niebla",
  lluvia: "Lluvia",
  nieve: "Nieve",
  tormenta: "Tormenta",
};

export interface PanelClimaProps {
  /** `true` cuando la alerta de vencimiento está montada (en móvil sube el panel). */
  alertaMontada?: boolean;
  /**
   * Habilita el botón de cerrar, visible solo en la variante flotante.
   * Al pulsarlo, el panel se oculta en esta visita y se ejecuta este callback
   * (la página lo usa para devolver el foco a un lugar previsible).
   */
  onCerrar?: () => void;
}

/**
 * Formatea una temperatura en grados enteros.
 *
 * @param valor Grados Celsius o `null` si la API no lo envió.
 * @returns `"24°"` o `"—"` cuando no hay dato.
 */
const formatearTemperatura = (valor: number | null): string =>
  valor === null ? "—" : `${Math.round(valor)}°`;

/**
 * Formatea el viento redondeado en km/h.
 *
 * @param valor Velocidad en km/h o `null`.
 * @returns `"10 km/h"` o `"—"`.
 */
const formatearViento = (valor: number | null): string =>
  valor === null ? "—" : `${Math.round(valor)} km/h`;

/**
 * Formatea la humedad relativa.
 *
 * @param valor Porcentaje o `null`.
 * @returns `"61%"` o `"—"`.
 */
const formatearHumedad = (valor: number | null): string =>
  valor === null ? "—" : `${Math.round(valor)}%`;

/**
 * Devuelve el nombre corto del día para la tira de pronóstico.
 *
 * @param fecha Fecha ISO `yyyy-mm-dd` de la API.
 * @param indice Posición en la lista (0 = hoy).
 * @returns `"Hoy"`, el día abreviado capitalizado o `""` si la fecha es inválida.
 */
const nombreDiaCorto = (fecha: string, indice: number): string => {
  if (indice === 0) return "Hoy";

  const dia = new Date(`${fecha}T12:00:00`);

  if (Number.isNaN(dia.getTime())) return "";

  const nombre = new Intl.DateTimeFormat("es-AR", { weekday: "short" })
    .format(dia)
    .replace(".", "");

  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
};

/**
 * Panel de clima de Salta Capital (spec 053).
 *
 * En escritorio vive en el encabezado del panel de la academia, con la imagen
 * a sangre de fondo. En `<= 1024px` el CSS lo convierte en un cuadro flotante
 * abajo a la izquierda con la imagen como miniatura.
 *
 * El cierre (`onCerrar`) es **solo de esta visita**: el estado es local y no se
 * guarda en ningún almacenamiento.
 */
export const PanelClima = ({
  alertaMontada = false,
  onCerrar,
}: PanelClimaProps) => {
  const { state, reintentar } = useClimaSalta();
  const [oculto, setOculto] = useState(false);
  const [imagenRota, setImagenRota] = useState(false);

  const actual = state.datos?.actual;
  const pronostico = state.datos?.pronostico ?? [];

  const fuenteImagen = actual
    ? imagenDeCondicion(actual.condicion)
    : IMAGEN_CLIMA_RESPALDO;
  const imagenFinal = imagenRota ? IMAGEN_CLIMA_RESPALDO : fuenteImagen;

  const clases = [
    "panel_clima",
    alertaMontada ? "panel_clima_con_alerta" : "",
    oculto ? "panel_clima_oculto" : "",
  ]
    .filter(Boolean)
    .join(" ");

  /**
   * Oculta el panel en esta visita y avisa a la página para mover el foco.
   */
  const cerrar = () => {
    setOculto(true);
    onCerrar?.();
  };

  return (
    <aside
      className={clases}
      aria-label={`Clima en ${UBICACION_CLIMA.ciudad}`}
      aria-busy={state.carga}
    >
      {onCerrar && (
        <button
          type="button"
          className="panel_clima_cerrar"
          aria-label="Ocultar el panel del clima"
          onClick={cerrar}
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}

      <div className="panel_clima_top">
        <div className="panel_clima_media" aria-hidden="true">
          <img
            className="panel_clima_imagen"
            src={imagenFinal}
            alt=""
            decoding="async"
            onError={() => setImagenRota(true)}
          />
          <span className="panel_clima_velo" />
        </div>

        {actual && !state.carga && (
          <div className="panel_clima_actual">
            <p className="panel_clima_condicion">
              {TEXTO_CONDICION[actual.condicion.tipo]}
            </p>
            <p className="panel_clima_temperatura">
              {formatearTemperatura(actual.temperatura)}
            </p>
          </div>
        )}
      </div>

      {state.carga && (
        <div className="panel_clima_esqueleto" aria-hidden="true">
          <span className="panel_clima_hueso panel_clima_hueso_titulo" />
          <span className="panel_clima_hueso panel_clima_hueso_valor" />
          <span className="panel_clima_hueso panel_clima_hueso_linea" />
        </div>
      )}

      {!state.carga && state.error && (
        <div className="panel_clima_error">
          <p className="panel_clima_error_texto" role="status">
            {state.error}
          </p>
          <button
            type="button"
            className="panel_clima_reintentar"
            onClick={reintentar}
          >
            Reintentar
          </button>
        </div>
      )}

      {!state.carga && !state.error && actual && (
        <>
          <div className="panel_clima_detalles">
            <span className="panel_clima_dato">
              <Thermometer size={16} aria-hidden="true" />
              <span>Sensación {formatearTemperatura(actual.sensacion)}</span>
            </span>
            <span className="panel_clima_dato">
              <Droplets size={16} aria-hidden="true" />
              <span>Humedad {formatearHumedad(actual.humedad)}</span>
            </span>
            <span className="panel_clima_dato">
              <Wind size={16} aria-hidden="true" />
              <span>Viento {formatearViento(actual.viento)}</span>
            </span>
          </div>

          <ul
            className="panel_clima_pronostico"
            aria-label="Pronóstico de los próximos 3 días"
          >
            {pronostico.map((dia, indice) => (
              <li className="panel_clima_dia" key={dia.fecha}>
                <span className="panel_clima_dia_nombre">
                  {nombreDiaCorto(dia.fecha, indice)}
                </span>
                <img
                  className="panel_clima_dia_img"
                  src={imagenDeCondicion(dia.condicion)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(evento) => {
                    const imagen = evento.currentTarget;

                    if (!imagen.src.endsWith("default.svg")) {
                      imagen.src = IMAGEN_CLIMA_RESPALDO;
                    }
                  }}
                />
                <span className="panel_clima_dia_temp">
                  <strong>{formatearTemperatura(dia.maxima)}</strong>
                  <span className="panel_clima_dia_min">
                    {formatearTemperatura(dia.minima)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
};
