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
        return { autenticado: false };
    }

    try {
        // Un JWT se divide en 3 partes separadas por puntos: header.payload.signature
        const payloadBase64 = token.split('.')[1];
        
        // Decodificamos el payload de Base64 a texto plano JSON
        const decodedPayload = JSON.parse(atob(payloadBase64));

        // Verificamos si tiene fecha de expiración y si ya pasó
        if (decodedPayload.exp) {
            const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
  
            if (currentTime >= decodedPayload.exp) {
                // El token expiró: lo borramos de las cookies y devolvemos falso
                Cookies.remove('token');
                return { autenticado: false };
            }
        }
    } catch (error) {
        // Si el token está corrupto o mal formado, lo borramos por seguridad
        Cookies.remove('token');
        return { autenticado: false };
    }

    // Si pasó todas las validaciones, el token existe y sigue vigente
    return {
        autenticado: true,
        token: token,
    };
}


interface RetornoVrificacion {
    error : boolean,
    message     : string,
    statusCode  : number,
    code        : string,
    errorsDetails : undefined

};



export const retornoVerificarAutenticacion = async() 
: Promise<RetornoVrificacion> =>{
    const verificarUser= await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: false,
            message: "Usuario no autenticado",
            statusCode: 401, 
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    } 
    
    return {
            error: true ,
            message: "Usuario autenticado",
            statusCode: 200, 
            code: "AUTHENTICATED",
            errorsDetails: undefined 
    }
};