export enum CodigoEstadoHTTP {
    // === 2xx ÉXITO ===
    OK = 200,                   // Solicitud exitosa (GET)
    CREADO = 201,               // Recurso creado exitosamente (POST)
    ACEPTADO = 202,             // Solicitud aceptada para procesamiento asíncrono
    SIN_CONTENIDO = 204,        // Solicitud exitosa, sin cuerpo de respuesta (DELETE, PUT)

    // === 3xx REDIRECCIÓN ===
    NO_MODIFICADO = 304,        // El cliente puede usar su versión cacheada

    // === 4xx ERRORES DEL CLIENTE ===
    SOLICITUD_INCORRECTA = 400, // Error genérico del cliente (ej: fallos de Zod)
    NO_AUTORIZADO = 401,        // Falta autenticación válida
    PROHIBIDO = 403,            // Autenticado, pero no tiene permisos (Autorización fallida)
    NO_ENCONTRADO = 404,        // Recurso inexistente
    METODO_NO_PERMITIDO = 405,  // Método no permitido para el recurso (ej: hacer POST en un endpoint de GET)
    CONFLICTO = 409,            // Conflicto de recurso (ej: ya existe)
    ENTIDAD_NO_PROCESABLE = 422, // Semántica incorrecta o fallo en la regla de negocio

    // === 5xx ERRORES DEL SERVIDOR ===
    ERROR_INTERNO_SERVIDOR = 500 // Error no manejado en el servidor
}