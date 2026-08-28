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

export interface ResultPostFlayer {};


export const postFlayer = async(  props : PropsPostFlayer) =>{

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