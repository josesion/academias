/**
 * Interfaz para la respuesta de éxito de la API.
 * @template T El tipo de los datos que devuelve la API en caso de éxito.
 */
export interface ApiSuccessResponse<T> {
    error: false;
    message: string;
    data: T;
    statusCode: number;
    paginacion?: {
        pagina: number;
        limite: number;
        contadorPagina: number;
    };
    code?: string;
}

/**
 * Interfaz para la respuesta de error (para cualquier fallo).
 */
export interface ApiErrorResponse {
    error: true;
    message: string;
    statusCode: number;
    code?: string;
    errorsDetails?: object;
}

/**
 * Tipo de unión para la respuesta general de la API.
 * @template T El tipo de datos esperado en el campo 'data' en una respuesta de éxito.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Interfaz base para el cuerpo JSON crudo que devuelve el backend.
 * Ajustamos los tipos de 'paginacion' y 'errorsDetails' a un objeto, no a un array.
 */
export interface BackendRawResponse {
    error: boolean;
    message: string;
    data?: any;
    paginacion?: {
        pagina: number;
        limite: number;
        contadorPagina: number;
    };
    code?: string;
    errorsDetails?: object;
}

/**
 * Define las opciones para tu fetch genérico.
 */
interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: object;
    headers?: HeadersInit;
    credentials?: RequestCredentials;
    signal?: AbortSignal;
}

/**
 * Función genérica para manejar peticiones a la API.
 * @template T El tipo de datos que esperas en 'data' cuando la petición es exitosa.
 * @param {string} url La URL a la que se realiza la petición.
 * @param {FetchOptions} [options] Opciones opcionales para la petición.
 * @returns {Promise<ApiResponse<T>>} Una promesa que se resuelve con la respuesta tipada.
 */
export async function apiFetch<T>(url: string, options?: FetchOptions ): Promise<ApiResponse<T>> {

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    try {
        const response: Response = await fetch(url, {
            method: options?.method || 'GET',
            headers: {
                ...defaultHeaders,
                ...(options?.headers || {}),
            },
            body: options?.body ? JSON.stringify(options.body) : undefined,
            credentials: options?.credentials || 'include',
            signal: options?.signal,
        });

        // 1. Manejo de respuestas HTTP no exitosas (4xx, 5xx)
        if (!response.ok) {
            let errorDetails: any;
            let errorMessage = `Error HTTP ${response.status}: ${response.statusText || 'Error desconocido'}`;
            let errorCode: string | undefined;

            try {
                // Intenta leer el cuerpo del error como JSON
                const rawErrorData: BackendRawResponse = await response.json();
                if (rawErrorData && typeof rawErrorData.message === 'string') {
                    errorMessage = rawErrorData.message;
                }
                // Los campos están en el nivel principal del objeto, no anidados
                errorDetails = rawErrorData.errorsDetails;
                errorCode = rawErrorData.code;
            } catch (jsonError) {
                console.warn(`No se pudo parsear la respuesta de error JSON para ${url}. Status: ${response.status}`);
            }

            return {
                error: true,
                message: errorMessage,
                statusCode: response.status,
                errorsDetails: errorDetails,
                code: errorCode,
            } as ApiErrorResponse;
        }

        // 2. Manejo de respuestas HTTP exitosas (2xx)
        const rawData: BackendRawResponse = await response.json();

        if (rawData.error === true) {
            // Si el backend indica un error lógico
            return {
                error: true,
                message: rawData.message || 'Operación fallida por lógica de negocio',
                statusCode: response.status,
                errorsDetails: rawData.errorsDetails, // Acceso directo, sin anidar en 'data'
                code: rawData.code, // Acceso directo, sin anidar en 'data'
            } as ApiErrorResponse;
        }

        // 3. Respuesta de éxito final
        return {
            error: false,
            message: rawData.message || 'Operación exitosa',
            data: rawData.data as T,
            paginacion: rawData.paginacion,
            statusCode: response.status,
            code: rawData.code,
        } as ApiSuccessResponse<T>;

    } catch (err: any) {
        // Manejar el AbortError y otros errores de red/cliente
        if (err.name === 'AbortError') {
            console.warn(`Petición abortada intencionalmente para ${url}`);
            return {
                error: true,
                message: "Petición cancelada por el usuario.",
                statusCode: 0,
                errorsDetails: { name: 'AbortError' },
                code: 'REQUEST_ABORTED',
            } as ApiErrorResponse;
        }

        // Manejo de errores de red o errores de JavaScript inesperados
        return {
            error: true,
            message: `Error de conexión o problema inesperado: ${err.message || 'Verifica tu conexión a internet.'}`,
            statusCode: 0,
        } as ApiErrorResponse;
    }
}
