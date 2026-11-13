/**
 * Clase de error personalizada que extiende la clase Error base de JavaScript.
 * Se utiliza para representar errores originados por el cliente (por ejemplo, solicitudes inválidas).
 * Permite especificar un código de estado HTTP asociado al error.
 *
 * @extends Error
 */

export class ClientError extends Error {
    statusCode  : number;// Agregamos la propiedad 'statusCode' para indicar el código de estado HTTP asociado al error
    code        : string;// Agregamos la propiedad 'code' como  'ER_DUP_ENTRY', 'VALIDATION_FAILED', etc. para mandar mas info al cliente

    /**
     * Crea una nueva instancia de ClientError.
     *
     * @param {string} message El mensaje descriptivo del error. Este mensaje se asigna a la propiedad 'message' del error.
     * @param {number} [status=400] El código de estado HTTP asociado al error. Por defecto es 400 (Bad Request).
     */

    constructor(message: string, status: number = 400, code: string = "ERROR_CLIENT") {
        super(message);
        this.statusCode = status;
        this.code = code;
    }

}; 