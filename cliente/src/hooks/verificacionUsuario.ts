import { VerificarPermisos } from "../servicio/permisosRutas";
interface AutenticacionResultado {
    autenticado: boolean;
    token?: string;
    mensaje?: string;
    statusCode?: number;
    code?: string;
}


export async function verificarAutenticacion(): Promise<AutenticacionResultado> {
    const resultToken = await VerificarPermisos();

    if (resultToken.error === false) {
        return {
            autenticado: true,
        };
    }

    return {
        autenticado: false,
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