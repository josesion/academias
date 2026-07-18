import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";


 type ModuloHistorial =
    | "ALUMNOS"
    | "PROFESORES"
    | "PLANES"
    | "INSCRIPCIONES"
    | "CAJA"
    | "HORARIOS"
    | "USUARIOS"
    | "GENEROS_MUSICALES"
    | "NIVELES_BAILE"
    | "TIPOS_BAILE"
    | "CATEGORIAS_CAJA"
    | "METODOS_PAGO"
    | "ASISTENCIAS";

type AccionHistorial =
    | "CREAR"
    | "MODIFICAR"
    | "ELIMINAR"
    | "RESTAURAR"
    | "ABRIR"
    | "CERRAR"
    | "INGRESO"
    | "EGRESO"
    | "LOGIN"
    | "LOGOUT";


export interface ResultHistorial {
    id_historial : number,
    modulo : ModuloHistorial,
    accion : AccionHistorial,
    descripcion : string,
    fecha  : Date,
    nombre : string,
    apellido : string
};

export const getHistorialMetrica =async ( signal? : AbortSignal  ) 
:Promise<ApiResponse<ResultHistorial[]>>=>{

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

    const ruta  = `${PAGINA}api/historial`;     

    return apiFetch( ruta , { method : "GET", signal : signal});

};


export interface HistorialInputs {
  id_escuela: number;
  id_usuario: number;
  modulo: ModuloHistorial
  accion: AccionHistorial
  id_registro?: number | null;
  descripcion: string;
  datos?: Record<string, unknown> | null;
};

type IdRegistro =  number | null | undefined ;

export interface ResultPostHistorial {
     modulo : ModuloHistorial, accion : AccionHistorial , id_registro : IdRegistro  
};


export const  postHistorial = async ( data : HistorialInputs, signal? : AbortSignal  ) 
:Promise<ApiResponse<ResultHistorial>>=>{

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

    const ruta  = `${PAGINA}api/historial`;     

    return apiFetch( ruta , { 
        method : "POST",
        body : {
            modulo : data.modulo,
            accion : data.accion,
            id_registro : data.id_registro ?? null,
            descripcion : data.descripcion,
            datos       : data.datos ?? null 
        },
        signal : signal});
};    