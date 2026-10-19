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
    "USER_NOT_FOUND": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "Usuario no encontrado"
    },
    ERROR_SERVIDOR
};

// Altas, modificaciones y listado de usuarios (los códigos los devuelve el
// Servicio de `usuario.servicio.ts` después de traducir los del hook).
export const MAPA_ALTA_USUARIO: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "CREAR_USUARIO_OK": {
        status: CodigoEstadoHTTP.CREADO,
        msg: "Usuario creado exitosamente"
    },
    "USUARIO_YA_REGISTRADO": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "Ese nombre de usuario ya está en uso"
    },
    ERROR_SERVIDOR
};

export const MAPA_MOD_USUARIO: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "MODIFICAR_USUARIO_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Usuario modificado exitosamente"
    },
    "USUARIO_NO_ENCONTRADO": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "No existe un usuario con ese identificador"
    },
    ERROR_SERVIDOR
};

export const MAPA_MOD_CONTRASENA: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "CONTRASENA_ACTUALIZADA": {
        status: CodigoEstadoHTTP.OK,
        msg: "Contraseña cambiada exitosamente"
    },
    "INVALID_PASSWORD": {
        status: CodigoEstadoHTTP.NO_AUTORIZADO,
        msg: "La contraseña actual es incorrecta"
    },
    "USUARIO_NO_ENCONTRADO": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "Usuario no encontrado"
    },
    ERROR_SERVIDOR
};

export const MAPA_LISTA_USUARIOS: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "LISTADO_USUARIOS_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Listado de usuarios"
    },
    "SIN_USUARIOS": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "Sin usuarios para ese filtro"
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
    "ALUMNO_EMAIL_EXISTE": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "El correo ya está registrado para otro alumno"
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