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
// Modificamos el tipado para que acepte id, rol, id_escuela y el login.
// Ojo: el `tokenData` de los dos caminos del login manda además `tipo`,
// `flayer` y `estado_suscripcion`, que viajan en el token aunque no estén
// declarados acá (es una variable, no un literal, así que TS no lo exige).
// `usuario` sí se declara porque `permisos.validarPermiso` lo lee para
// completar `req.usuario` y de ahí sale el nombre real en `logs_eventos`.
export const generateToken = (payload: { id: number; rol: string; id_escuela: number; usuario: string }): string => {
    try {
        const token = jwt.sign(
            payload, // Ahora viaja: { id: 3, rol: "usuario", id_escuela: 107, usuario: "josejefe" }
            process.env.JWT_CLAVE || "jjsskkss", 
            { expiresIn: "60m" }
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

    const esProduccion = process.env.NODE_ENV === "production";

    const cookieOpcion = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        path: "/",
        httpOnly: true,
        secure: esProduccion,
        sameSite: esProduccion ? "none" as const : "lax" as const
    };

    return cookieOpcion;
}

