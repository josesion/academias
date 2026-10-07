import { VerificarPermisos } from "../servicio/permisosRutas";

interface DatosUsuarioAuth {
    usuario: string;
    rol: string;
    razon_social: string;
    tipo: string; 
}

interface AutenticacionResultado {
    autenticado: boolean;
    token?: string;
    mensaje?: string;
    statusCode?: number;
    code?: string;
    usuario?: DatosUsuarioAuth | null;
}


/**
 * `true` solo si el server respondió **401 o 403**: eso sí significa
 * "sesión vencida / sin permisos". La red caída (`statusCode: 0`) y un 500
 * **no** cierran la sesión (no hay que borrar la cookie por un corte
 * momentáneo de internet).
 *
 * @param r - Respuesta de `VerificarPermisos` o de `verificarAutenticacion`.
 * @returns `true` si hay que cerrar la sesión.
 */
export const esSesionVencida = (r: { statusCode?: number }): boolean =>
    r.statusCode === 401 || r.statusCode === 403;

export async function verificarAutenticacion(): Promise<AutenticacionResultado> {
    const resultToken = await VerificarPermisos();

    if (resultToken.error === false) {
        return {
            autenticado: true,
            usuario: resultToken.data,
            statusCode: 200,
        };
    }

    // Se propagan `statusCode` y `code` para poder distinguir un token
    // vencido (401/403) de un error de red o del server.
    return {
        autenticado: false,
        usuario: null,
        statusCode: resultToken.statusCode,
        code: resultToken.code,
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