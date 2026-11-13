import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


                         
export const MAPA_POST_IMAGEN: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    "FORMATO_IMAGEN_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El formato de la imagen no está permitido.",
    },

    "TAMANO_IMAGEN_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "La imagen no puede superar los 2 MB.",
    },

    "ERROR_SUBIR_IMAGEN": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No se pudo subir la imagen.",
    },

    "SIN_PERMISOS": {
        status: CodigoEstadoHTTP.PROHIBIDO,
        msg:  "Superlo el limite de su plan.",
    },

    "FLAYER_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Imagen subida correctamente.",
    },

    ERROR_SERVIDOR

};


export const MAPA_GET_FLAYERS: Record<
    string,
    { status: CodigoEstadoHTTP; msg: string }
> = {

    "FLAYERS_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Flayers para el carrusel.",
    },

    "SIN_FLAYERS": {
        status: CodigoEstadoHTTP.SIN_CONTENIDO,
        msg: "No se encontraron flayers para el carrusel.",
    },

    ERROR_SERVIDOR

};

export const MAPA_DELETE_FLAYERS: Record<
    string,
    { status: CodigoEstadoHTTP; msg: string }
> = {

    "SUCCESS": {
        status: CodigoEstadoHTTP.OK,
        msg: "Flayers eliminado correctamente.",
    },

    "ERROR_EN_BORRAR_FLAYER": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No se encontró parámetros de la imagen para eliminar.",
    },

    ERROR_SERVIDOR

};