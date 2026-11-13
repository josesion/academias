import { CodigoEstadoHTTP } from "../tipados/generico";

export const MAPA_REGISTRO_GRATUITO: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {
    "REGISTRO_GRATUITO_OK": { status: CodigoEstadoHTTP.OK, msg: "Registro creado correctamente" },
    "USUARIO_EXISTE": { status: CodigoEstadoHTTP.CONFLICTO, msg: "El usuario ya existe" },
    "DNI_YA_REGISTRADO": { status: CodigoEstadoHTTP.CONFLICTO, msg: "El DNI ya está registrado" },
    "CORREO_YA_REGISTRADO": { status: CodigoEstadoHTTP.CONFLICTO, msg: "El correo ya está registrado" },
    "PLAN_NO_ENCONTRADO": { status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, msg: "Plan gratuito no encontrado" },
    "USUARIO_DISPONIBLE": { status: CodigoEstadoHTTP.OK, msg: "Usuario disponible" },
    "USUARIO_NO_DISPONIBLE": { status: CodigoEstadoHTTP.OK, msg: "Usuario no disponible" },
    "VALIDATION_ERROR": { status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA, msg: "Error de validación" },
    "ERROR_SERVIDOR": { status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, msg: "Error en el servidor" },
};
