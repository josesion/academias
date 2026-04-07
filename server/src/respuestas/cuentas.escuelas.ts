import { CodigoEstadoHTTP } from "../tipados/generico";    

export const MAPA_CUENTAS_CREACCION : Record<string, { status : CodigoEstadoHTTP, msg : string}> = {

    "CUENTAS_CREADA_EXITOSAMENTE" : { status : CodigoEstadoHTTP.OK, msg : "Cuenta creada exitosamente"},
    
    "CUENTAS_ERROR_CREACION" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, 
                                 msg : "Error en el servidor al crear la cuenta, por favor intente nuevamente"},

    "CUENTAS_EXISTE" : { status : CodigoEstadoHTTP.CONFLICTO, 
                         msg : "Ya existe una cuenta con el mismo nombre y tipo para esta escuela"},

    "ERROR_SERVIDOR" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE ,
                         msg : "Error en el servidor , por favor intente nuevamente "},
};
    

    
export const MAPA_CUENTAS_MODIFICACION: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    
    "CUENTAS_MODIFCADA_EXITOSAMENTE": { status: CodigoEstadoHTTP.OK, msg: "Cuenta actualizada." },

    "CUENTAS_EXISTE": { status: CodigoEstadoHTTP.CONFLICTO,
                            msg:  "Ya existe una cuenta con el mismo nombre y tipo para esta escuela" },

    "CUENTAS_ERROR_MODIFICACION": { status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, 
                                        msg:  "Error en el servidor al modificar la cuenta",},

    "ERROR_SERVIDOR" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE ,
                        msg : "Error en el servidor , por favor intente nuevamente "},                                     
};    


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;