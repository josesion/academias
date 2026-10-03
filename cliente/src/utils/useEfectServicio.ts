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
  } = data;

  useEffect(() => {
    if (!enabled) return;

    let controller: AbortController | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (useAbort) {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller?.abort(), 8000);
    }

    const generica = async () => {
      try {
        dispatch(accionCarga(true));

        const result = await servicios(valores, controller?.signal);

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
        dispatch(accionCarga(false));
      }
    };

    generica();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (controller) controller.abort();
    };
  }, [...dependencias, enabled]);
};