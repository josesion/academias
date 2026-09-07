import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

export interface ReturnCarrucel {
    id_flayer: number;
    id_escuela: number;
    titulo: string;
    descripcion: string;
    imagen_url: string;   
};


export const getCarrucel = async ()
:Promise<ApiResponse<ReturnCarrucel[]>> =>{
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };   

    const ruta  = `${PAGINA}api/get_flayer`;      
    
    return apiFetch( ruta , { method : "GET" });    
};

export interface PropsPostFlayer {
    imagen : File,
    titulo : string,
    descripcion : string,
    plan  : number  
};

export interface ReturnPostFlayer {
    id? : number,
    titulo : string,
    descripcion : string ,
    imagen_url : string,
    public_id  : string,
};


export const postFlayer = async(  props : PropsPostFlayer)
:Promise<ApiResponse<ReturnPostFlayer>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };
    
    const {  titulo, descripcion, plan, imagen} = props;

    const formData = new FormData();

    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("plan", String(plan));
    formData.append("imagen", imagen);

    const ruta  = `${PAGINA}api/flayer`;  
    
    return apiFetch( ruta, {
        method : "POST",
        body :  formData
    });
    
};



export const getAllEscuelas = async ()
:Promise<ApiResponse<ReturnCarrucel>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };

    const ruta  = `${PAGINA}api/get_flayer`;  
    
    return apiFetch( ruta, {
        method : "GET"
    });    
};



export const getFlayersEscuela = async ()
:Promise<ApiResponse<ReturnCarrucel>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };

    const ruta  = `${PAGINA}api/get_flayer_escuela`;  
    
    return apiFetch( ruta, {
        method : "GET"
    });    
};


export const deletFlayerEscuela = async ( id_flayer : number ) =>{
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };    
    const ruta  = `${PAGINA}api/delete_flayer_escuela/${id_flayer}`;  
    
    return apiFetch( ruta, {
        method : "GET"
    });  

};