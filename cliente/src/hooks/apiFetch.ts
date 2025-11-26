/**
 * Interfaz para la respuesta de éxito de la API.
 * @template T El tipo de los datos que devuelve la API en caso de éxito.
 */




/**
 * Interfaz para la respuesta exitosa
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
    meta?: {
        clientTimestamp: string;
        serverTimestamp?: string | null;
        durationMs?: number;
        responseSize: number;
    };
}

/**
 * Interfaz para la respuesta de error
 */
export interface ApiErrorResponse {
    error: true;
    message: string;
    statusCode: number;
    code?: string;
    errorsDetails?: object;
    meta?: {
        clientTimestamp: string;
        serverTimestamp?: string | null;
        durationMs?: number;
        responseSize: number;
    };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Estructura base que devuelve el backend
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
    meta?: {
        serverTimestamp?: string | null;
        durationMs?: number;
    };
}

interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: object;
    headers?: HeadersInit;
    credentials?: RequestCredentials;
    signal?: AbortSignal;
}

/**
 * apiFetch PRO – totalmente optimizado
 */
export async function apiFetch<T>(
    url: string,
    options?: FetchOptions
): Promise<ApiResponse<T>> {
   
    const clientTimestamp = new Date().toISOString();
    const start = performance.now();
    const calcDuration = () => Number((performance.now() - start).toFixed(2));

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    try {

        const response = await fetch(url, {
            method: options?.method || 'GET',
            headers: {
                ...defaultHeaders,
                ...(options?.headers || {})
            },
            body: options?.body ? JSON.stringify(options.body) : undefined,
            credentials: options?.credentials || 'include',
            signal: options?.signal
        });

       
           //  AQUI — leer la respuesta cruda
           // se consume el cuerpo de la respuesta como texto
        const rawText = await response.text();
        const responseSize = new TextEncoder().encode(rawText).length;



        // ----------------------------
        //  MANEJO DE RESPUESTAS HTTP ERROR (4xx / 5xx)
        // ----------------------------
        if (!response.ok) {
            let raw: BackendRawResponse | null = null;

            try {
                raw = rawText ? JSON.parse(rawText) : null;
            } catch (_) {
                // Si no pudo parsear JSON, raw queda en null
            }

            return {
                error: true,
                message: raw?.message || `Error HTTP ${response.status}`,
                statusCode: response.status,
                errorsDetails: raw?.errorsDetails,
                code: raw?.code,
                meta: {
                    clientTimestamp,
                    serverTimestamp: raw?.meta?.serverTimestamp ?? null ,
                    durationMs: calcDuration(),
                    responseSize : responseSize
                }
            };
        }

        // ----------------------------
        //  RESPUESTA EXITOSA -> PARSEAR JSON
        // ----------------------------
        const rawData: BackendRawResponse = rawText ? JSON.parse(rawText) : { error: false, message: "", data: null };

        // Si el backend indica error lógico
        if (rawData.error) {
            return {
                error: true,
                message: rawData.message,
                statusCode: response.status,
                errorsDetails: rawData.errorsDetails,
                code: rawData.code,
                meta: {
                    clientTimestamp,
                    serverTimestamp: rawData.meta?.serverTimestamp ?? null,
                    durationMs: calcDuration(),
                    responseSize : responseSize
                }
            };
        }

        // ----------------------------
        //  RESPUESTA EXITOSA REAL
        // ----------------------------
        return {
            error: false,
            message: rawData.message || "Operación exitosa",
            data: rawData.data as T,
            statusCode: response.status,
            paginacion: rawData.paginacion,
            code: rawData.code,
            meta: {
                clientTimestamp,
                serverTimestamp: rawData.meta?.serverTimestamp  ?? null ,
                durationMs: calcDuration(),
                responseSize : responseSize
            }
        };

    } catch (err: any) {

        // ----------------------------
        //  ERROR POR ABORTAR MANUALMENTE
        // ----------------------------
        if (err.name === 'AbortError') {
            return {
                error: true,
                message: "Petición cancelada",
                statusCode: 0,
                code: "REQUEST_ABORTED",
                meta: { 
                    clientTimestamp ,
                    durationMs: calcDuration(),
                    responseSize: 0
                }
            };
        }

        // ----------------------------
        //  ERROR DE RED / DESCONEXIÓN
        // ----------------------------
        return {
            error: true,
            message: "Error de conexión o inesperado: " + (err.message || ""),
            statusCode: 0,
            meta: { 
                    clientTimestamp  , 
                    durationMs: calcDuration(), 
                    responseSize: 0
                    }
            };
    }
}
