import { CodigoEstadoHTTP } from "../tipados/generico";

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const;


export const MAPA_LISTAR_LOG_EVENTOS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "LOG_EVENTOS_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Listado de eventos ok."
    },

    "SIN_LOG_EVENTOS" : {
            status: CodigoEstadoHTTP.SIN_CONTENIDO,
            msg: "Sin eventos para ese filtro."
    },

};

export const MAPA_MARCAR_LOG_EVENTOS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "LOG_MARCADO_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Evento marcado como revisado."
    },

    "LOG_NO_ENCONTRADO" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "No existe un evento con ese id."
    },

};

