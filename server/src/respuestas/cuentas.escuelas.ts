import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const MAPA_CUENTAS_CREACCION : Record<string, { status : CodigoEstadoHTTP, msg : string}> = {

    "CUENTAS_CREADA_EXITOSAMENTE" : { status : CodigoEstadoHTTP.OK, msg : "Cuenta creada exitosamente"},
    
    "CUENTAS_ERROR_CREACION" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, 
                                 msg : "Error en el servidor al crear la cuenta, por favor intente nuevamente"},

    "CUENTAS_EXISTE" : { status : CodigoEstadoHTTP.CONFLICTO, 
                         msg : "Ya existe una cuenta con el mismo nombre y tipo para esta escuela"},

    ERROR_SERVIDOR
};
    

    
export const MAPA_CUENTAS_MODIFICACION: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    
    "CUENTAS_MODIFCADA_EXITOSAMENTE": { status: CodigoEstadoHTTP.OK, msg: "Cuenta actualizada." },

    "CUENTAS_EXISTE": { status: CodigoEstadoHTTP.CONFLICTO,
                            msg:  "Ya existe una cuenta con el mismo nombre y tipo para esta escuela" },

    "CUENTAS_ERROR_MODIFICACION": { status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, 
                                        msg:  "Error en el servidor al modificar la cuenta",},
   
    ERROR_SERVIDOR                                    
};    

export const MAPA_CUENTAS_ESTADO : Record< string, {  status : CodigoEstadoHTTP , msg : string }> = {

    "CUENTAS_MODIFICADA_EXITOSAMENTE": { status : CodigoEstadoHTTP.OK ,
                                         msg : "Estado de cuenta modificado exitosamente"},

    "ERROR_CUENTAS_SERVIDOR" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , 
                                 msg : "Error en el servidor al modificar el estado de la cuenta"},

    ERROR_SERVIDOR                             
};


export const MAPA_CUENTAS_LISTADO : Record< string , { status : CodigoEstadoHTTP, msg : string}> ={

     "LISTADO_TIPOS_CUENTAS_OK" : { status : CodigoEstadoHTTP.OK,
                                    msg : "Listado Tipos Cuentas ok" },
                                    
     "SIN_LISTADO_TIPOS_CUENTAS" : { status : CodigoEstadoHTTP.OK,
                                    msg : "Listado Tipos Cuentas ok" },    
     ERROR_SERVIDOR                            
};

export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;