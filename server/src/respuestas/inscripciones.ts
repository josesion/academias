import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;

export const MAPA_INSCRIPCION : Record< string, { status : CodigoEstadoHTTP , msg : string}> = {

     "INSCRIPCION_EXISTENTE" : { status : CodigoEstadoHTTP.CONFLICTO , msg : "El alumno ya se encuentra inscripto actualmente"},

    "INSCRIPCION_CREACION_FALLIDA" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE, msg : "No se pudo crear la inscripción"},

    "NO_SE_LOGRO_VERIFICAR" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE, msg : "No se pudo crear la inscripción"},

    "INSCRIPCION_EXITOSA" : { status : CodigoEstadoHTTP.OK , msg : "Inscripcion creada Exitosamente "},

    ERROR_SERVIDOR
};


export const MAPA_LISTADO_INSCRIPCIONES : Record< string , { status : CodigoEstadoHTTP , msg : string} > = {

    "LISTADO_INSCRIPCION_OK" : { status : CodigoEstadoHTTP.OK , msg : "Listado de inscripciones obtenido correctamente" },

   "LISTADO_VACIO" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No se encontraron inscripciones con los filtros aplicados"}, 

    ERROR_SERVIDOR
};

export const MAPA_ANULACION_INSCRIPCION : Record< string , { status : CodigoEstadoHTTP , msg : string} > ={
   
    "NO_EXISTE_CAJA" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "Abrir caja antes porfavor" },

    "SIN_CATEGORIA_ANULACION" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "Error, No se encontro Categoria anulacion" },
   
    "ERROR_VALIDACION_INSCRIPCION" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE, msg : "Error, No se logro obtener regla de anulacion" },

    "SIN_PERMISO" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "No cumple con los requisitos para anular" },
   
    "ERROR_SIN_METODO_PAGO" : { status :CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE , msg : "Error, No se logro detectar el metodo de pago" },

    "SALDO_INSUFICIENTE_CAJA" : { status :CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE, msg : "No cuenta con el monto suficiente" },

  
    "TRANSACCION_FALLIDA_ANULAR_INCRIPCION" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , msg : "Error, ocurrio un problema intenerno en la operacion" },

    "TRANSACCION_EXITOSA_ANULACION_INSCRIPCION" : { status : CodigoEstadoHTTP.OK , msg : "Anulacion de la inscripcion Correctamente" },
    

    ERROR_SERVIDOR 
};

export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;