import type {
  ClimaCondicion,
  ClimaDia,
  ClimaSalta,
  TipoCondicionClima,
} from "../tipadosTs/clima.typado";

/**
 * Servicio del panel de clima (spec 053).
 *
 * Es el **primer** `fetch` del cliente que no pasa por `apiFetch`: la respuesta
 * viene de un tercero (Open-Meteo) y no del backend propio, así que no tiene el
 * contrato `ApiResponse`. No se usa ninguna librería HTTP extra.
 */

/** Ciudad y coordenadas fijas del panel (Capital de Salta). */
export const UBICACION_CLIMA = {
  ciudad: "Salta Capital",
  latitud: -24.7859,
  longitud: -65.4117,
} as const;

/**
 * URL publica de Open-Meteo: sin API key y con CORS abierto.
 * `timezone` devuelve las horas y fechas en hora de Salta y `forecast_days=3`
 * limita el pronóstico a los tres días que muestra el panel.
 */
export const URL_CLIMA_SALTA =
  "https://api.open-meteo.com/v1/forecast?latitude=-24.7859&longitude=-65.4117&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FArgentina%2FSalta&forecast_days=3";

/** Imagen que se usa cuando no hay condición conocida o falla el asset. */
export const IMAGEN_CLIMA_RESPALDO = "/clima/default.svg";

/** Nombre de archivo (sin extensión ni carpeta) de cada condición de día. */
const ARCHIVO_POR_CONDICION: Record<TipoCondicionClima, string> = {
  despejado: "despejado-dia",
  parcial: "parcial-dia",
  nublado: "nublado",
  niebla: "niebla",
  lluvia: "lluvia",
  nieve: "nieve",
  tormenta: "tormenta",
};

/**
 * Indica si un valor desconocido es un objeto plano indexable.
 *
 * @param valor Valor recibido desde el JSON de la API.
 * @returns `true` si se puede leer con claves.
 */
const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

/**
 * Convierte un valor desconocido en número finito o `null`.
 *
 * @param valor Dato crudo de la API (puede faltar o venir `null`).
 * @returns El número, o `null` si no es un número válido.
 */
const numeroONull = (valor: unknown): number | null =>
  typeof valor === "number" && Number.isFinite(valor) ? valor : null;

/**
 * Traduce el código WMO de Open-Meteo a la condición visual del panel.
 *
 * Solo `despejado` y `parcial` llevan variante nocturna; el resto de las
 * condiciones comparten imagen de día y de noche. Cualquier código no mapeado
 * cae en `nublado` con la marca `desconocido` para usar `default.png`.
 *
 * @param codigo `weather_code` de la API (WMO).
 * @param isDay `is_day` de la API: `0` significa noche.
 * @returns Condición normalizada (nunca `null`).
 */
export const condicionDesdeCodigoWmo = (
  codigo: unknown,
  isDay: unknown
): ClimaCondicion => {
  const numero = numeroONull(codigo);
  const nocturno = numeroONull(isDay) === 0;

  if (numero === 0) return { tipo: "despejado", nocturno };
  if (numero === 1 || numero === 2) return { tipo: "parcial", nocturno };
  if (numero === 3) return { tipo: "nublado", nocturno: false };
  if (numero === 45 || numero === 48) return { tipo: "niebla", nocturno: false };
  // 51-57 llovizna, 61-67 lluvia, 80-82 chubascos
  if (
    (numero !== null && numero >= 51 && numero <= 67) ||
    (numero !== null && numero >= 80 && numero <= 82)
  ) {
    return { tipo: "lluvia", nocturno: false };
  }
  // 71-77 nieve, 85-86 chubascos de nieve
  if (
    (numero !== null && numero >= 71 && numero <= 77) ||
    numero === 85 ||
    numero === 86
  ) {
    return { tipo: "nieve", nocturno: false };
  }
  // 95-99 tormenta
  if (numero !== null && numero >= 95 && numero <= 99) {
    return { tipo: "tormenta", nocturno: false };
  }

  return { tipo: "nublado", nocturno: false, desconocido: true };
};

/**
 * Resuelve la ruta publica de la imagen que corresponde a una condición.
 *
 * @param condicion Condición normalizada del clima actual o de un día.
 * @returns Ruta absoluta dentro de `public/clima/`.
 */
export const imagenDeCondicion = (condicion: ClimaCondicion): string => {
  if (condicion.desconocido) return IMAGEN_CLIMA_RESPALDO;

  if (
    condicion.nocturno &&
    (condicion.tipo === "despejado" || condicion.tipo === "parcial")
  ) {
    return condicion.tipo === "despejado"
      ? "/clima/despejado-noche.svg"
      : "/clima/parcial-noche.svg";
  }

  return `/clima/${ARCHIVO_POR_CONDICION[condicion.tipo]}.svg`;
};

/**
 * Normaliza el bloque `daily` en la lista corta de pronóstico.
 *
 * Los cuatro arrays pueden venir con largos distintos: se itera hasta el
 * mínimo para no pintar días incompletos y se recorta a 3.
 *
 * @param daily Bloque `daily` crudo de la API.
 * @returns Días completos del pronóstico (0 a 3).
 */
const normalizarPronostico = (
  daily: Record<string, unknown>
): ClimaDia[] => {
  const fechas = Array.isArray(daily.time) ? daily.time : [];
  const codigos = Array.isArray(daily.weather_code)
    ? daily.weather_code
    : [];
  const maximas = Array.isArray(daily.temperature_2m_max)
    ? daily.temperature_2m_max
    : [];
  const minimas = Array.isArray(daily.temperature_2m_min)
    ? daily.temperature_2m_min
    : [];

  const total = Math.min(
    fechas.length,
    codigos.length,
    maximas.length,
    minimas.length
  );

  const dias: ClimaDia[] = [];

  for (let indice = 0; indice < total; indice += 1) {
    const fecha = fechas[indice];

    if (typeof fecha !== "string") continue;

    dias.push({
      fecha,
      maxima: numeroONull(maximas[indice]),
      minima: numeroONull(minimas[indice]),
      condicion: condicionDesdeCodigoWmo(codigos[indice], 1),
    });
  }

  return dias.slice(0, 3);
};

/**
 * Valida y aplana la respuesta de Open-Meteo al contrato `ClimaSalta`.
 *
 * @param crudo JSON ya parseado (tipo desconocido a propósito).
 * @returns Datos normalizados, o `null` si falta la forma mínima.
 */
const normalizarRespuesta = (crudo: unknown): ClimaSalta | null => {
  if (!esObjeto(crudo)) return null;

  const current = crudo.current;
  const daily = crudo.daily;

  if (!esObjeto(current) || !esObjeto(daily)) return null;

  const pronostico = normalizarPronostico(daily);

  if (pronostico.length === 0) return null;

  return {
    actual: {
      temperatura: numeroONull(current.temperature_2m),
      sensacion: numeroONull(current.apparent_temperature),
      humedad: numeroONull(current.relative_humidity_2m),
      viento: numeroONull(current.wind_speed_10m),
      condicion: condicionDesdeCodigoWmo(
        current.weather_code,
        current.is_day
      ),
    },
    pronostico,
    obtenidoEn: Date.now(),
  };
};

/**
 * Pide el clima de Salta Capital a Open-Meteo.
 *
 * No lanza por "datos feos": valida la forma y, si no coincide, lanza un
 * `Error` de dominio con código (`CLIMA_HTTP_*` o `CLIMA_DATOS_INVALIDOS`)
 * que el hook traduce a un mensaje para la vista.
 *
 * @param signal Señal de aborto para cancelar cuando el componente se desmonta.
 * @returns Clima actual + pronóstico de 3 días.
 */
export const obtenerClimaSalta = async (
  signal?: AbortSignal
): Promise<ClimaSalta> => {
  const respuesta = await fetch(URL_CLIMA_SALTA, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
  });

  if (!respuesta.ok) {
    throw new Error(`CLIMA_HTTP_${respuesta.status}`);
  }

  const crudo: unknown = await respuesta.json();
  const datos = normalizarRespuesta(crudo);

  if (!datos) {
    throw new Error("CLIMA_DATOS_INVALIDOS");
  }

  return datos;
};
