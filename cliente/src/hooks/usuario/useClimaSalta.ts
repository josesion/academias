import { useCallback, useEffect, useState } from "react";

import type { ClimaSalta, EstadoClima } from "../../tipadosTs/clima.typado";
import { obtenerClimaSalta } from "../../servicio/clima.fetch";

/**
 * Hook del panel de clima (spec 053).
 *
 * Encapsula la red y la caché para que el componente solo pinte:
 * - caché en memoria del módulo **y** `sessionStorage` con TTL de 15 minutos;
 * - una única petición compartida mientras hay componentes suscritos (evita el
 *   doble `fetch` de `StrictMode` en desarrollo);
 * - `AbortController` con timeout de 8 s y aborto diferido al desmontar;
 * - `reintentar()` para el botón del estado de error.
 */

/** Clave de `sessionStorage` donde se guarda la última respuesta. */
const CLAVE_CACHE = "academia:clima-salta:v1";

/** Vigencia de la caché: 15 minutos. */
const TTL_MS = 15 * 60 * 1000;

/** Corte de la petición para no dejar la UI esperando. */
const TIMEOUT_MS = 8000;

/** Mensaje único que ve el usuario cuando la consulta falla. */
const MENSAJE_ERROR = "No pudimos cargar el clima.";

/** Envoltorio guardado en caché: datos + momento del guardado. */
interface CacheClima {
  guardadoEn: number;
  datos: ClimaSalta;
}

let cacheMemoria: CacheClima | null = null;
let promesaEnVuelo: Promise<ClimaSalta> | null = null;
let abortador: AbortController | null = null;
let suscriptores = 0;

/**
 * Indica si una entrada de caché sigue vigente.
 *
 * @param entrada Entrada leída de memoria o de `sessionStorage`.
 * @returns `true` si no superó el TTL.
 */
const cacheVigente = (entrada: CacheClima): boolean =>
  Date.now() - entrada.guardadoEn < TTL_MS;

/**
 * Valida de forma superficial la forma de una entrada guardada.
 *
 * @param valor JSON parseado de `sessionStorage` (tipo desconocido).
 * @returns `true` si se puede usar como caché del panel.
 */
const esCacheValida = (valor: unknown): valor is CacheClima => {
  if (typeof valor !== "object" || valor === null) return false;

  const entrada = valor as Record<string, unknown>;
  const datos = entrada.datos as Record<string, unknown> | null | undefined;

  return (
    typeof entrada.guardadoEn === "number" &&
    typeof datos === "object" &&
    datos !== null &&
    typeof datos.actual === "object" &&
    Array.isArray(datos.pronostico)
  );
};

/**
 * Lee la caché vigente, primero en memoria y después en `sessionStorage`.
 *
 * Descarta (y limpia) las entradas vencidas o corruptas. Si `sessionStorage`
 * está bloqueado se sigue funcionando solo con la caché en memoria.
 *
 * @returns La entrada vigente o `null`.
 */
const leerCache = (): CacheClima | null => {
  if (cacheMemoria && cacheVigente(cacheMemoria)) return cacheMemoria;

  cacheMemoria = null;

  try {
    const guardado = window.sessionStorage.getItem(CLAVE_CACHE);

    if (!guardado) return null;

    const parseado: unknown = JSON.parse(guardado);

    if (!esCacheValida(parseado) || !cacheVigente(parseado)) {
      window.sessionStorage.removeItem(CLAVE_CACHE);
      return null;
    }

    cacheMemoria = parseado;
    return parseado;
  } catch {
    return null;
  }
};

/**
 * Guarda la respuesta en memoria y en `sessionStorage`.
 *
 * @param datos Clima recién obtenido de Open-Meteo.
 */
const guardarCache = (datos: ClimaSalta): void => {
  const entrada: CacheClima = { guardadoEn: Date.now(), datos };
  cacheMemoria = entrada;

  try {
    window.sessionStorage.setItem(CLAVE_CACHE, JSON.stringify(entrada));
  } catch {
    // Modo privado o cuota llena: la caché en memoria alcanza.
  }
};

/** Vacía la caché para forzar una nueva consulta. */
const limpiarCache = (): void => {
  cacheMemoria = null;

  try {
    window.sessionStorage.removeItem(CLAVE_CACHE);
  } catch {
    // Sin `sessionStorage` no hay nada que limpiar.
  }
};

/**
 * Devuelve la petición en vuelo o arranca una nueva con timeout.
 *
 * La promesa se comparte a nivel de módulo para que dos montajes simultáneos
 * (React `StrictMode`) generen **una sola** llamada a la API.
 *
 * @returns Promesa del clima de Salta Capital.
 */
const iniciarPeticion = (): Promise<ClimaSalta> => {
  if (promesaEnVuelo) return promesaEnVuelo;

  const control = new AbortController();
  abortador = control;

  const temporizador = window.setTimeout(() => control.abort(), TIMEOUT_MS);

  promesaEnVuelo = obtenerClimaSalta(control.signal)
    .then((datos) => {
      guardarCache(datos);
      return datos;
    })
    .finally(() => {
      window.clearTimeout(temporizador);

      if (abortador === control) abortador = null;

      promesaEnVuelo = null;
    });

  return promesaEnVuelo;
};

/**
 * Hook que entrega el clima de Salta Capital y su estado de carga/error.
 *
 * @returns `{ state, reintentar }`: datos normalizados y la acción para volver
 * a consultar ignorando la caché.
 */
export const useClimaSalta = () => {
  const [state, setState] = useState<EstadoClima>(() => {
    const cache = leerCache();

    return cache
      ? { datos: cache.datos, carga: false, error: null }
      : { datos: null, carga: true, error: null };
  });

  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    let activo = true;

    suscriptores += 1;

    const cache = leerCache();

    if (cache) {
      setState({ datos: cache.datos, carga: false, error: null });
    } else {
      setState((previo) => ({ ...previo, carga: true, error: null }));

      iniciarPeticion()
        .then((datos) => {
          if (activo) setState({ datos, carga: false, error: null });
        })
        .catch(() => {
          if (activo) setState({ datos: null, carga: false, error: MENSAJE_ERROR });
        });
    }

    return () => {
      activo = false;
      suscriptores -= 1;

      if (suscriptores > 0) return;

      // Se difiere el aborto un microtask: en `StrictMode` el remontaje
      // alcanza a suscribirse y reutiliza la petición en vuelo.
      queueMicrotask(() => {
        if (suscriptores > 0 || !abortador) return;

        const control = abortador;
        abortador = null;
        promesaEnVuelo = null;
        control.abort();
      });
    };
  }, [reintentos]);

  /**
   * Vuelve a consultar el clima descartando la caché vigente.
   */
  const reintentar = useCallback(() => {
    limpiarCache();
    setReintentos((previo) => previo + 1);
  }, []);

  return { state, reintentar };
};
