import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";

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
    | "ELIMINAR"
    | "ANULACION"
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
    const ruta  = `${PAGINA}api/historial`;     

    return apiFetch( ruta , { method : "GET", signal : signal});

};




