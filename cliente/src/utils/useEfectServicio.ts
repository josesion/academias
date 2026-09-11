import { useEffect } from "react";

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
    dependencias?: React.DependencyList;
    useAbort?: boolean;
    enabled?: boolean; // NUEVO: Condición para disparar el fetch
};

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
        dependencias = [],
        useAbort = false,
        enabled = true // Por defecto arranca en true si no se especifica
    } = data;

    useEffect(() => {
        // Si está deshabilitado (ej. porque el id_escuela es null), salimos al toque
        if (!enabled) return;

        let controller: AbortController | undefined;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        if (useAbort) {
            controller = new AbortController();
            timeoutId = setTimeout(() => controller?.abort(), 8000);
        };

        const generica = async () => {
            try {
                dispatch(accionCarga(true));
           
                const result = await servicios(valores, controller?.signal);

                if (result.statusCode >= 200 && result.statusCode < 300) {
                    dispatch(accionResultado(result.data));
                } else {
                    dispatch(accionResultado(null));
                    dispatch(accionError(result.message || "Error desconocido"));
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
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