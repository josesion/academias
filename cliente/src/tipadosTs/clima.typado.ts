/**
 * Tipos del panel de clima (spec 053).
 *
 * La fuente es Open-Meteo, que devuelve un `weather_code` WMO. El servicio
 * (`src/servicio/clima.fetch.ts`) normaliza ese código a una de estas
 * condiciones y el componente solo consume esta forma.
 */

/**
 * Condición climática normalizada.
 *
 * - `lluvia` cubre llovizna y chubascos.
 * - Solo `despejado` y `parcial` admiten variante nocturna.
 */
export type TipoCondicionClima =
  | "despejado"
  | "parcial"
  | "nublado"
  | "niebla"
  | "lluvia"
  | "nieve"
  | "tormenta";

/** Condición ya resuelta: tipo + si corresponde la imagen nocturna. */
export interface ClimaCondicion {
  tipo: TipoCondicionClima;
  /** `true` cuando la consulta se hizo de noche (`is_day === 0`). */
  nocturno: boolean;
  /**
   * `true` solo si el código WMO no está mapeado. Permite mostrar
   * `default.png` aunque la condición de respaldo sea `nublado`.
   */
  desconocido?: boolean;
}

/** Clima actual de Salta Capital, ya en unidades de la API (°C y km/h). */
export interface ClimaActual {
  temperatura: number | null;
  sensacion: number | null;
  humedad: number | null;
  viento: number | null;
  condicion: ClimaCondicion;
}

/** Un día del pronóstico corto (3 días). */
export interface ClimaDia {
  /** Fecha ISO `yyyy-mm-dd` en la zona horaria de Salta. */
  fecha: string;
  maxima: number | null;
  minima: number | null;
  condicion: ClimaCondicion;
}

/** Datos completos que consume el panel. */
export interface ClimaSalta {
  actual: ClimaActual;
  pronostico: ClimaDia[];
  /** Marca de tiempo (`Date.now()`) del momento en que se obtuvo. */
  obtenidoEn: number;
}

/** Estado que expone `useClimaSalta` a la vista. */
export interface EstadoClima {
  datos: ClimaSalta | null;
  carga: boolean;
  error: string | null;
}
