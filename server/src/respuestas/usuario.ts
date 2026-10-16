import { CodigoEstadoHTTP } from "../tipados/generico";

const ERROR_SERVIDOR = { 
    status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, 
    msg: "Error interno de servidor, intente nuevamente" 
} as const;

export const MAPA_OBTENER_PERFIL: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "PROFILE_FETCHED": {
        status: CodigoEstadoHTTP.OK,
        msg: "Perfil obtenido correctamente"
    },
    ERROR_SERVIDOR
};

export const MAPA_MODIFICAR_PERFIL: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "PROFILE_UPDATED": {
        status: CodigoEstadoHTTP.OK,
        msg: "Perfil actualizado correctamente"
    },
    "USERNAME_TAKEN": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "El nombre de usuario ya está en uso"
    },
    "EMAIL_TAKEN": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "El correo electrónico ya está en uso"
    },
    "USERNAME_MUST_BE_EMAIL": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "Para rol alumno el usuario debe ser un email válido"
    },
    "INVALID_PASSWORD": {
        status: CodigoEstadoHTTP.NO_AUTORIZADO,
        msg: "La contraseña actual es incorrecta"
    },
    "USER_NOT_FOUND": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "Usuario no encontrado"
    },
    ERROR_SERVIDOR
};