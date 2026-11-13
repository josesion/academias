import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { 
    status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg: "Error interno de servidor , intente nuevamente" 
} as const;

// Constante compartida para los errores de imagen
const ERRORES_IMAGEN = {
    "FORMATO_IMAGEN_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El formato de la imagen no está permitido."
    },
    "TAMANO_IMAGEN_INVALIDO": {
        status: CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
        msg: "La imagen no puede superar los 2 MB."
    },
    "ERROR_SUBIR_IMAGEN": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No se pudo subir la imagen a Cloudflare R2."
    }
} as const;

export const MAPA_POST_ESCUELA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
    ERROR_SERVIDOR,
    ...ERRORES_IMAGEN,
    "DNI_RAZON_SOCIAL_EXISTENTE": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "La razón social o DNI ya se encuentran registrados."
    },
    "ESCUELA_POST_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Escuela agregada con éxito."
    },
}; 

export const MAPA_MODIFICAR_ESCUELA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
    ERROR_SERVIDOR,
    ...ERRORES_IMAGEN,
    "DNI_RAZON_SOCIAL_EXISTENTE": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "La razón social o DNI ya se encuentran registrados."
    },
    "ESCUELA_UPDATE_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Escuela actualizada con éxito."
    },
};


export const MAPA_ESTADO_ESCUELA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
    ERROR_SERVIDOR,

   'CAMBIO_ESTADO_ESCUELA': {
        status: CodigoEstadoHTTP.OK,
        msg: "Estado de la escuela actualizado con éxito."
    },
};

export const MAPA_LISTADO_ESCUELA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
    ERROR_SERVIDOR,
    "LISTADO_ESCUELA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Listado de escuelas obtenido correctamente."
    },
    "SIN_RESULTADOS_ESCUELA": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "No hay escuelas para el filtro indicado."
    }
};