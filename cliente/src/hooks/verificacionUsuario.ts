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


export async function verificarAutenticacion(): Promise<AutenticacionResultado> {
    const resultToken = await VerificarPermisos();

    if (resultToken.error === false) {
        return {
            autenticado: true,
            usuario: resultToken.data
        };
    }

    return {
        autenticado: false,
        usuario: null
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