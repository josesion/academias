import { Response } from "express";

/**
 * Tipo auxiliar para representar información de paginación.
 *
 * @typedef {Object} Paginacion
 * @property {number} pagina - Número de la página actual.
 * @property {number} limite - Cantidad de elementos por página.
 * @property {number} contadorPagina - Total de páginas disponibles.
 */
export type Paginacion = {
    pagina: number;
    limite: number;
    contadorPagina: number;
};

/**
 * Envía una respuesta JSON estandarizada al cliente.
 * Esta función centraliza y normaliza las respuestas exitosas desde los controladores,
 * permitiendo mantener una estructura uniforme en toda la API.
 *
 * @param {Response} res - Objeto de respuesta de Express.
 * @param {number} statusCode - Código de estado HTTP (ej. 200, 201, 204).
 * @param {string} message - Mensaje descriptivo sobre el resultado de la operación.
 * @param {any} [data] - Datos opcionales a incluir en la respuesta.
 * @param {Paginacion} [paginacion] - Información de paginación, si aplica.
 * @param {string} [code="SUCCESS"] - Código de respuesta personalizado (ej. "SUCCESS", "CREATED", etc).
 * @returns {void}
 *
 * @example
 * // Ejemplo de uso en un controlador
 * const usuarios = await Usuario.findAll();
 * enviarResponse(res, 200, "Listado de usuarios", { usuarios });
 *
 * @example
 * // Ejemplo con paginación
 * enviarResponse(res, 200, "Usuarios paginados", { usuarios }, { pagina: 1, limite: 10, contadorPagina: 5 });
 */
export const enviarResponse = (
    res: Response,
    statusCode: number,
    message: string,
    data?: any,
    paginacion?: Paginacion | undefined ,
    code: string = "SUCCESS"
): void => {
    res.status(statusCode).json({
        error: false,
        message,
        data,
        paginacion,
        code
    });
};
