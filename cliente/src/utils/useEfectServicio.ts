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

  useAbort?: boolean
};



/**
 * Hook para gestionar la ejecución de servicios asíncronos con manejo de estados,
 * cancelación de peticiones (AbortController) y tiempo límite (timeout) opcional.
 *
 * @template T - Tipo de los valores/parámetros de entrada para el servicio.
 * @template R - Tipo de la respuesta esperada del servicio.
 * @template A - Tipo de la acción (o cualquier dato extra necesario).
 *
 * @param {Object} props - Configuración del hook.
 * @param {boolean} props.useAbort - Si es true, activa el AbortController y el temporizador.
 * @param {Function} props.servicios - Función de servicio API (debe aceptar `signal` como parámetro).
 * @param {T} props.valores - Parámetros necesarios para ejecutar el servicio.
 * @param {Array<any>} props.dependencias - Array de dependencias para el useEffect.
 * @param {Function} props.dispatch - Función de dispatch para actualizar el estado global.
 * @param {Function} props.accionCarga - Action creator para actualizar el estado de carga.
 * @param {Function} props.accionResultado - Action creator para actualizar el resultado exitoso.
 * @param {Function} props.accionError - Action creator para manejar errores.
 *
 * @description
 * El hook ejecuta el servicio solicitado y gestiona el ciclo de vida de la petición:
 * 1. Si `useAbort` es true, establece un temporizador de 8 segundos.
 * 2. Si la petición supera el tiempo, se aborta automáticamente (AbortError).
 * 3. En el `catch`, ignora el `AbortError` para evitar mensajes de error falsos al usuario.
 * 4. El `finally` asegura la limpieza del temporizador y el estado de carga.
 */
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
    useAbort = false
  } = data;

  useEffect(() => {
    let controller: AbortController | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (useAbort) {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller?.abort(), 8000);
    };

    const generica = async () => {
      try {
        dispatch(accionCarga(true));
   
        const result = await servicios(valores , controller?.signal);
        
        if (result.statusCode >= 200 && result.statusCode < 300) {
          dispatch(accionResultado(result.data));
        } else {
          dispatch(accionResultado(null));
          dispatch(accionError(result.message  || "Error desconocido" ));
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
  }, dependencias);
};