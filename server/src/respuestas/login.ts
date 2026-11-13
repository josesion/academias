import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;

export const MAPA_LOGUEO : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {


   "VERIFICAR_USUARIO" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "Sin contenido de tipo cuentas" },    
    
   "USUARIO_EXISTE" : { status : CodigoEstadoHTTP.OK, msg : "lista tipos cuentas listado ok"},

   "USUARIO_NO_EXISTE" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "Sin contenido de tipo cuentas" },
   
   ERROR_SERVIDOR

};


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;