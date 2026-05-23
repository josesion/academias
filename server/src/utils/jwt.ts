// Importa la librería para la generación y manejo de tokens JWT
import jwt from "jsonwebtoken";

// Importa dotenv para poder acceder a variables de entorno definidas en un archivo .env
import dotenv from 'dotenv';

// Importa una clase de error personalizada para manejo controlado de errores
import { ClientError } from "../utils/error";

// Carga las variables de entorno definidas en el archivo .env
dotenv.config();

/**
 * Genera un token JWT firmado usando el identificador del usuario.
 * 
 * @param payload - Objeto que contiene el identificador del usuario (por ejemplo, { id: "usuario123" })
 * @returns Token JWT como string
 * @throws ClientError si hay un fallo durante la generación del token
 */
// Modificamos el tipado para que acepte id, rol e id_escuela
export const generateToken = (payload: { id: number; rol: string; id_escuela: number }): string => {
    try {
        const token = jwt.sign(
            payload, // Ahora viaja: { id: 3, rol: "usuario", id_escuela: 107 }
            process.env.JWT_CLAVE || "jjsskkss", 
            { expiresIn: "30m" }
        );
        return token;
    } catch (error) {
        throw new ClientError("Error al generar el token", 500);
    }
};
/**
 * Crea una configuración de cookie para ser enviada al cliente.
 * 
 * Esta cookie:
 * - Expira en 1 día
 * - Tiene como ruta raíz "/"
 * 
 * @returns Objeto con las opciones de configuración de la cookie
 */
export function crearCookie() {
    const cookieOpcion = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día
        path: "/" // Ruta válida para toda la app
    };
    return cookieOpcion;
}

