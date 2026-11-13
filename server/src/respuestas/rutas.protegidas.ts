import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;

export const MAPA_VERIFICACION_SESION  : Record<string, { status : CodigoEstadoHTTP, msg : string}> ={
    
    "ERROR_SERVIDOR_USUARIO" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
                                 msg : "Error al validar la sesion"},

   "AUTHORIZED" : { status : CodigoEstadoHTTP.OK, msg : "Usuario autorizado"}, 
   
   "UNAUTHORIZED" : { status : CodigoEstadoHTTP.NO_AUTORIZADO , msg : "No autorizado"},

   ERROR_SERVIDOR
};


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;