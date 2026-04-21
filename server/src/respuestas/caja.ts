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


export const MAPA_LISTA_TIPO_CUENTAS : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {
   
   "LISTA_TIPOS_CUENTAS_OK" : { status : CodigoEstadoHTTP.OK, msg : "lista tipos cuentas listado ok"},

   "LISTA_TIPO_CUENTAS_VACIO" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "Sin contenido de tipo cuentas" },
   
   ERROR_SERVIDOR

};

export const MAPA_ABRIR_CAJA  : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "CAJA_ABIERTA" : { status : CodigoEstadoHTTP.CONFLICTO, msg : "Se encuentra una caja abierta"},

  "CAJA_ABIERTA_OK" : { status : CodigoEstadoHTTP.OK , msg : "Se abrio una caja correctamente"},

  ERROR_SERVIDOR

};

export const MAPA_CERRAR_CAJA : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "CIERRE_CAJA_OK"  : { status : CodigoEstadoHTTP.OK , msg : "Caja cerrada exitosamente" },

  "NO_HAY_CAJA_ABIERTA" : { status : CodigoEstadoHTTP.CONFLICTO , msg : "No existe ninguna caja abierta"},

  ERROR_SERVIDOR

};

export const MAPA_DETALLE_MOVIMIENTOS : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "DETALLE_CAJA_OK" : { status : CodigoEstadoHTTP.OK , msg : "Se creo correctante el detall de caja." },

  "ERROR_ABRIR_CAJA_DETALLE" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , msg : "Error al crear el detalle, intente nuevamente"}

};

export const MAPA_CAJA_ABIERTA : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "ID_CAJA_OK" : { status : CodigoEstadoHTTP.OK , msg : "La caja se encuentra abierta"},

  "SIN_CAJA_ABIERTA" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No se encuentra ninguna caja abierta"},

  ERROR_SERVIDOR,

};



export const MAPA_LISTADO_CAJAS : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "MOVIMIENTOS_CAJA_OK" : { status : CodigoEstadoHTTP.OK , msg : "Movimientos de caja obtenidos"},

   "MOVIMIENTOS_CAJA_VACIO" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No se encontraron movimientos de caja"},

  ERROR_SERVIDOR,
  
};

export const MAPA_LISTADO_CATEGORIAS : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

   "LISTADO_CATEGORIA_OK" : { status : CodigoEstadoHTTP.OK , msg : "Listado Categorias obtenidos"},

   "LISTADO_CATEGORIA_VACIO" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No se encontraron categorias"},

  ERROR_SERVIDOR,
  
};


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;