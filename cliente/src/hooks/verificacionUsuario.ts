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