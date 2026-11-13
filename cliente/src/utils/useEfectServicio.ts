import { useEffect } from "react";

export interface Paginacion {
  pagina: number;
  limite: number;
  contadorPagina: number;
}

type ServicioCrud<T> = (
  data?: T,
  signal?: AbortSignal
) => Promise<any>;

interface DataServicios<T, R, A> {
  valores?: T;
  servicios: ServicioCrud<T>;

  dispatch: React.Dispatch<A>;
  accionResultado: (data: R | null) => A;
  accionCarga: (estado: boolean) => A;
  accionError: (mensaje: string | null) => A;
  accionPaginacion?: (paginacion: Paginacion) => A; // opcional
  dependencias?: React.DependencyList;
  useAbort?: boolean;
  enabled?: boolean;

  /**
   * Si es `true`, una petición **cancelada** (`REQUEST_ABORTED`) no pisa el
   * resultado ni el error, y el flag de carga solo baja si este effect sigue
   * vigente (spec 038).
   *
   * Por defecto es `false` → comportamiento **idéntico** al actual para todas
   * las pantallas que usan esta util.
   *
   * Por qué existe: al tipear en un buscador, la petición anterior se aborta
   * (el cleanup llama a `controller.abort()`). Sin esto, ese abort caía en la
   * rama de error → `accionResultado(null)` (¡vacía la lista!) y
   * `accionError("Petición cancelada")` (pisa el mensaje de la pantalla).
   */
  ignorarCancelados?: boolean;
}

export const useEffectServicio = <T, R, A>(
  data: DataServicios<T, R, A>
) => {
  const {
    servicios,
    valores,
    dispatch,
    accionResultado,
    accionCarga,
    accionError,
    accionPaginacion,
    dependencias = [],
    useAbort = false,
    enabled = true,
    ignorarCancelados = false,
  } = data;

  useEffect(() => {
    if (!enabled) {
      // El bloque se apagó: el flag tiene que bajar, o queda trabado en `true`.
      if (ignorarCancelados) dispatch(accionCarga(false));
      return;
    }

    let controller: AbortController | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    // `vigente` distingue la petición actual de las ya superadas: cuando las
    // dependencias cambian, el cleanup marca esta instancia como no vigente y
    // su respuesta se descarta (spec 038).
    let vigente = true;

    if (useAbort) {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller?.abort(), 8000);
    }

    const generica = async () => {
      try {
        dispatch(accionCarga(true));

        const result = await servicios(valores, controller?.signal);

        // Petición cancelada: se intercepta ANTES del chequeo de statusCode
        // (si no, caería en la rama de error y vaciaría el listado).
        if (ignorarCancelados && result?.code === "REQUEST_ABORTED") {
          // Si el effect ya no es el vigente, la respuesta se descarta entera:
          // la petición nueva es la que manda (y la que baja el flag).
          if (!vigente) return;
          // Timeout con el effect vigente: se avisa, pero sin vaciar la lista.
          dispatch(accionError("El servidor tardó demasiado en responder."));
          return;
        }

        if (result.statusCode >= 200 && result.statusCode < 300) {
          dispatch(accionResultado(result.data));

          // Solo si el hook recibió la acción Y la respuesta trae paginación
          if (accionPaginacion && result.paginacion) {
            dispatch(accionPaginacion(result.paginacion));
          }
        } else {
          dispatch(accionResultado(null));
          dispatch(accionError(result.message || "Error desconocido"));
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          dispatch(accionError("Error de conexión"));
        }
      } finally {
        // Con `ignorarCancelados`, una petición superada NO baja el flag: lo
        // baja la petición vigente, para que el spinner no se apague antes de
        // que llegue la respuesta que el usuario está esperando.
        if (!ignorarCancelados || vigente) {
          dispatch(accionCarga(false));
        }
      }
    };

    generica();

    return () => {
      vigente = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (controller) controller.abort();
    };
  }, [...dependencias, enabled]);
};