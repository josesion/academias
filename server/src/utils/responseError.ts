import { Response } from "express";

/**
 * Envía una respuesta JSON de error al cliente con el código de estado y el mensaje de error especificados.
 * Esta función se utiliza para mantener un formato consistente para las respuestas de error en la API.
 *
 * @param {import('express').Response} res El objeto de respuesta de Express utilizado para enviar la respuesta de error.
 * @param {number} status El código de estado HTTP que indica el error (ej: 400 para Solicitud Incorrecta, 500 para Error Interno del Servidor).
 * @param {string} message El mensaje de error a incluir en el cuerpo de la respuesta JSON.
 * @returns {void}
 *
 * @example
 * // Ejemplo de uso en un middleware de manejo de errores o controlador de ruta:
 * try {
 * // Algún código que podría lanzar un error
 * throw new ClientError('Entrada inválida', 400);
 * } catch (error) {
 * enviarResponseError(res, error.statusCode || 500, error.message);
 * }
 */


export const enviarResponseError = (res: Response, 
                                    statusCode: number,
                                    message: string ,
                                    code : string = "ClientError",
                                    errorsDetails?: any[] | undefined  // ? es opcional  
                                    ) => {
    res.status(statusCode).json({
        error: true,
        message, 
        code ,
        errorsDetails
    });
};