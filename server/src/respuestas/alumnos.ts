import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_ALTA_ALUMNO : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    "ERROR_ALTA_PRIMARIA" : { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , msg : "Error  al dar alta primaria" },

    "ALUMNO_YA_REGISTRADO" : { status : CodigoEstadoHTTP.CONFLICTO , msg : "El alumno ya se encuentra registrado"},

    "REGISTRO_ALUMNO_OK"  : { status : CodigoEstadoHTTP.OK , msg : "Se registro Correctamente el alumno"},

    ERROR_SERVIDOR

};     

export const MAPA_MOD_ALUMNO : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {
    
    "ALUMNO_MODIFICAR_OK" : { status : CodigoEstadoHTTP.OK, msg : "Modificacion Correcta."},

    ERROR_SERVIDOR
};

export const MAPA_ESTADO_ALUMNO : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {
    
   "CAMBIO_ESTADO_ALUMNO_OK" : { status : CodigoEstadoHTTP.OK, msg : "Modificacion de estado Correcta."},

    ERROR_SERVIDOR
};

export const MAPA_LISTAR_ALUMNOS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    "ALUMNO_LISTED_OK" : { status : CodigoEstadoHTTP.OK, msg : "Listado de alumnos obtenido correctamente."},

    ERROR_SERVIDOR
};


export const MAPA_LISTAR_SIN_PAGINACION_ALUMNOS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    "ALUMNO_LISTED_OK" : { status : CodigoEstadoHTTP.OK, msg : "Listado de alumnos obtenido correctamente."},
    
    ERROR_SERVIDOR
};
