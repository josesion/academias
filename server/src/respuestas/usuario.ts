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
    "ALUMNO_CAMPOS_DIFERENTES": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "Para un alumno, usuario y correo deben ser el mismo valor"
    },
    // Alumno sin fila en `alumnos` sincronizada (no se pudo resolver su dni):
    // no se escribe nada para no dejar datos a medias. Se reporta como falla
    // interna (500) SIN revelar el detalle del dni al usuario.
    "ALUMNO_SIN_DNI": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "Error interno al procesar la solicitud. Intente nuevamente."
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

// --- Logo de la escuela en el perfil (spec 051) ---
// Los 3 exitos van con HTTP 200 (`handleControladores` solo trata `OK` como
// exito). `public_id` nunca viaja en el `data` de ninguna respuesta.

export const MAPA_ESCUELA_PERFIL: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "ESCUELA_PERFIL_FETCHED": {
        status: CodigoEstadoHTTP.OK,
        msg: "Escuela obtenida correctamente"
    },
    "ESCUELA_NO_ENCONTRADA": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "No se encontró la escuela del usuario"
    },
    ERROR_SERVIDOR
};

export const MAPA_ESCUELA_LOGO_ACTUALIZADO: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "ESCUELA_LOGO_ACTUALIZADO": {
        status: CodigoEstadoHTTP.OK,
        msg: "Logo actualizado correctamente"
    },
    "ARCHIVO_REQUERIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "Debe adjuntar una imagen"
    },
    "FORMATO_IMAGEN_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El formato de la imagen no está permitido."
    },
    "TAMANO_IMAGEN_INVALIDO": {
        status: CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
        msg: "La imagen no puede superar los 2 MB."
    },
    "ESCUELA_NO_ENCONTRADA": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "No se encontró la escuela del usuario"
    },
    "ERROR_SUBIR_IMAGEN": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No se pudo subir la imagen a Cloudflare R2."
    },
    ERROR_SERVIDOR
};

export const MAPA_ESCUELA_LOGO_QUITADO: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "ESCUELA_LOGO_QUITADO": {
        status: CodigoEstadoHTTP.OK,
        msg: "Logo quitado correctamente"
    },
    "ESCUELA_NO_ENCONTRADA": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "No se encontró la escuela del usuario"
    },
    ERROR_SERVIDOR
};