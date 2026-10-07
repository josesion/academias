import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const;


export const MAPA_LISTAR_USUARIO_ADMIN : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "LISTADO_ALUMNOS_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Listado de alumnos ok."
    },

    "LISTADO_USUARIOS_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Listado de usuarios ok."
    },

    "SIN_ALUMNOS" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin alumnos para ese filtro."
    },

    "SIN_USUARIOS" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin usuarios para ese filtro."
    },

}; 

export const MAPA_CREAR_USUARIO_ADMIN : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "CREAR_USUARIO_ADMIN_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Usuario admin creado."
    },

    "USUARIO_YA_REGISTRADO" : {
            status: CodigoEstadoHTTP.CONFLICTO,
            msg: "Ese nombre de usuario ya está en uso."
    },

}; 

export const MAPA_ACTUALIZAR_USUARIO_ADMIN : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "ACTUALIZAR_USUARIO_ADMIN_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Usuario admin actualizado."
    },

    "USUARIO_NO_ENCONTRADO" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "No existe un usuario con ese id."
    },

    "USUARIO_YA_REGISTRADO" : {
            status: CodigoEstadoHTTP.CONFLICTO,
            msg: "Ese nombre de usuario ya está en uso."
    },

    "USUARIO_YA_CORREO" : {
            status: CodigoEstadoHTTP.CONFLICTO,
            msg: "Ese correo ya está en uso por otro usuario."
    },

}; 

export const MAPA_ELIMINAR_USUARIO_ADMIN : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "USUARIO_ADMIN_ESTADO_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Estado de la cuenta actualizado."
    },

    "USUARIO_NO_ENCONTRADO" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "No existe un usuario con ese id."
    },

    "USUARIO_PROPIO_NO_BAJA" : {
            status: CodigoEstadoHTTP.CONFLICTO,
            msg: "No podés dar de baja tu propia cuenta."
    },

    "ULTIMO_ADMINISTRADOR" : {
            status: CodigoEstadoHTTP.CONFLICTO,
            msg: "No se puede inactivar al último administrador activo."
    },

}; 
