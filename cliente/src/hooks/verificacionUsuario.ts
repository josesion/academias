import Cookies from 'js-cookie';

interface AutenticacionResultado {
    autenticado: boolean;
    token?: string;
    mensaje?: string;
    statusCode?: number;
    code?: string;
}

/**
 * Función que se encarga exclusivamente de verificar la autenticación
 * a través de la cookie.
 * @returns {Promise<AutenticacionResultado>} Un objeto con el resultado de la verificación.
 */
export async function verificarAutenticacion(): Promise<AutenticacionResultado> {
    const token = Cookies.get('token');

    if (!token) {
        return {
            autenticado: false
        };
    }

    return {
        autenticado: true,
        token: token,
    };
}