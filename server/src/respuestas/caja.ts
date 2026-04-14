import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;

export const MAPA_METRICAS_PANEL : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

  "METRICAS_CAJA_CUENTAS_OK" : { status : CodigoEstadoHTTP.OK, 
                                     msg : "Metricas de caja y cuentas listadas ok" },
  "SIN_METRICAS_CAJA_CUENTAS" : { status : CodigoEstadoHTTP.NO_ENCONTRADO,
                                       msg : "Sin metricas de caja " },
  ERROR_SERVIDOR                                       
};


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;