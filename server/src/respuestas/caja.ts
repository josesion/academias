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

  "RETENCIONES_ACTIVAS" : { status : CodigoEstadoHTTP.CONFLICTO , msg : "No se puede cerrar la caja con retenciones activas. Resuelve las retenciones pendientes primero."},

  ERROR_SERVIDOR

};

export const MAPA_DETALLE_MOVIMIENTOS : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "DETALLE_CAJA_OK" : { status : CodigoEstadoHTTP.OK , msg : "Se creo correctante el detall de caja." },

  "SIN_CAJA_ABIERTA" : { status :CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No hay caja abierta"},

  "SIN_SALDO" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Sin saldo para realizar esta operacion"},

  "CATEGORIA_SISTEMA" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Las categorías del sistema no se pueden usar en este formulario"},

  "ERROR_ABRIR_CAJA_DETALLE" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , msg : "Error al crear el detalle, intente nuevamente"}

};

export const MAPA_CAJA_ABIERTA : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "ID_CAJA_OK" : { status : CodigoEstadoHTTP.OK , msg : "La caja se encuentra abierta"},

  "SIN_CAJA_ABIERTA" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No se encuentra ninguna caja abierta"},

  ERROR_SERVIDOR,

};

export const MAPA_METRICA_PRINCIPAL : Record< string, {status : CodigoEstadoHTTP , msg :string} > = {
   
  "METRICAS_PRINCIPAL_OK" : { status : CodigoEstadoHTTP.OK, msg : "Metricas panel principal ok"},
   
  "SIN_METRICAS_PANEL_PRINCIPAL" :{ status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "Sin metricas principales"},
   
  ERROR_SERVIDOR
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

export const MAPA_LISTADO_CATEGORIAS_SESION : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

 'LISTA_TIPOS_CUENTAS_OK': { status : CodigoEstadoHTTP.OK , msg : "Listado Categorias obtenidos"},

   "SIN_LISTADO_CUENTAS": { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No se encontraron categorias"},

  "SIN_CAJA_ABIERTA" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "Sin caja abierta."},

  ERROR_SERVIDOR,
  
};


export const MAPA_TRANSFERENCIA_CAJA : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "TRANSFERENCIA_OK" : { status : CodigoEstadoHTTP.OK , msg : "Transferencia registrada correctamente"},

  "SIN_CAJA_ABIERTA" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No hay caja abierta"},

  "CUENTA_INVALIDA" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Cuenta inválida"},

  "SIN_SALDO" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Sin saldo suficiente en la cuenta de origen"},

  "CATEGORIAS_TRANSFERENCIA_FALTAN" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Faltan las categorías de sistema para transferencias"},

  "TRANSFERENCIA_ERROR" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , msg : "No se pudo registrar la transferencia"},

  ERROR_SERVIDOR

};

export const MAPA_RETENCION_CAJA : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "RETENCION_OK" : { status : CodigoEstadoHTTP.OK , msg : "Retención registrada correctamente"},

  "SIN_CAJA_ABIERTA" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No hay caja abierta"},

  "CUENTA_INVALIDA" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Cuenta inválida"},

  "SIN_SALDO" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Sin saldo suficiente en la cuenta"},

  "CATEGORIA_RETENCION_FALTA" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Falta la categoría de sistema para retenciones"},

  "RETENCION_ERROR" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , msg : "No se pudo registrar la retención"},

  ERROR_SERVIDOR

};

export const MAPA_RETENCIONES_ACTIVAS : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "RETENCIONES_ACTIVAS_OK" : { status : CodigoEstadoHTTP.OK , msg : "Retenciones activas listadas correctamente"},

  "SIN_CAJA_ABIERTA" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No hay caja abierta"},

  ERROR_SERVIDOR

};

export const MAPA_RESOLVER_RETENCION : Record< string , { status : CodigoEstadoHTTP, msg : string}> = {

  "RETENCION_DEVUELTA" : { status : CodigoEstadoHTTP.OK , msg : "Retención devuelta correctamente"},

  "RETENCION_JUSTIFICADA" : { status : CodigoEstadoHTTP.OK , msg : "Retención justificada correctamente"},

  "RETENCION_NO_EXISTE" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "La retención indicada no existe"},

  "RETENCION_YA_RESUELTA" : { status : CodigoEstadoHTTP.CONFLICTO , msg : "La retención ya fue devuelta o justificada"},

  "MONTO_DEVUELTO_INVALIDO" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "No se puede devolver más de lo retenido"},

  "OBSERVACION_REQUERIDA" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "La observación es obligatoria"},

  "CATEGORIA_RETENCION_FALTA" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Falta la categoría de sistema para retenciones"},

  "RETENCION_RESOLVER_ERROR" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , msg : "No se pudo resolver la retención"},

  ERROR_SERVIDOR

};

export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;