import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_LOCALIZAR_INSCRIPCION_CATEGORIA_CAJA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

   "SIN_CATEGORIA_INSCRIPCION" : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "No se encontro el id de isncripcion"
    },

 "CATEGORIA_INSCRIPCION_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Categoria inscripcion encontrada con exito."
  },
  
}; 


export const MAPA_ALTA_CATEGORIA_CAJA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "CATEGORIA_CAJA_EXISTENTE" : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "Esta categoria de caja ya existe."
    },

  "CATEGORIA_CAJA_ALTA" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Categoria creada exitosamente."
  },  
}; 


export const MAPA_MOD_CATEGORIA_CAJA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

     "SIN_PERMISOS" : {
        status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
        msg : "Sin permisos."
    },

    "CATEGORIA_CAJA_EXISTENTE" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "Categoria ya existente."
  },    

  "CATEGORIA_CAJA_MODIFICAR" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Categoria modificada exitosamente."
  },  
}; 

export const MAPA_ESTADO_CATEGORIA_CAJA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

     "SIN_PERMISOS" : {
        status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
        msg : "Sin permisos."
    },

    "CATEGORIA_CAJA_EXISTENTE" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "Categoria ya existente."
  },    

  "CATEGORIA_CAJA_ESTADO_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Categoria ESTADO modificada exitosamente."
  },  
}; 

export const MAPA_LISTADO_CATEGORIA_CAJA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

     "SIN_PERMISOS" : {
        status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
        msg : "Sin permisos."
    },

  "SIN_LISTADO_CATEGORIA_CAJA" : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "Sin listado, modifar el filtrado."
  },    

  "LISTADO_CATEGORIA_CAJA": {
        status : CodigoEstadoHTTP.OK,
        msg : "Listado de categorias de caja."
  },  
}; 