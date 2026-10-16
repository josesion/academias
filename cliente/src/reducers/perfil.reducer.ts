/* ==========================================================================
   REDUCER DE PERFIL DE USUARIO
   Maneja la carga del perfil (GET /api/usuario_perfil) y la edición
   (PUT /api/usuario_perfil) del usuario logueado (rol "usuario" o "alumno").
   ========================================================================== */

import type { PerfilCompleto, MiPerfilResult } from "../servicio/usuario.perfil.fetch";

/* ==========================================================================
   CONSTANTES DEL FORMULARIO (definidas aquí para que hook y componente las usen)
   ========================================================================== */

/** Claves editables del formulario */
export type CampoFormularioKey =
    | "usuario"
    | "nombre"
    | "apellido"
    | "correo"
    | "celular"
    | "contrasena_actual"
    | "nueva_contrasena"
    | "confirmar_contrasena";

/** Campos obligatorios para validación en cliente */
export const CAMPOS_OBLIGATORIOS: { campo: CampoFormularioKey; etiqueta: string }[] = [
    { campo: "usuario", etiqueta: "el usuario" },
    { campo: "correo", etiqueta: "el correo" },
    // contrasena_actual NO es obligatoria global: solo se requiere si se cambia la contraseña
];

/* ==========================================================================
   TIPOS
   ========================================================================== */

export interface CampoPerfil {
    name: string;
    value: string;
}

/** Estado del formulario de perfil */
export interface FormularioPerfil {
    usuario: CampoPerfil;
    nombre: CampoPerfil;
    apellido: CampoPerfil;
    correo: CampoPerfil;
    celular: CampoPerfil;
    contrasena_actual: CampoPerfil;
    nueva_contrasena: CampoPerfil;
    confirmar_contrasena: CampoPerfil;
}

/** Estado completo del reducer */
export interface PerfilTipado {
    // Datos del perfil cargados del server
    datos: PerfilCompleto | null;

    // Formulario
    formulario: FormularioPerfil;

    // UI
    carga: {
        inicial: boolean;    // GET inicial
        guardar: boolean;    // PUT submit
    };
    error: {
        inicial: string | null;
        guardar: string | null;
        campo: Partial<Record<CampoFormularioKey, string>>;
    };
    exito: boolean;
}

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */

export const initialPerfil = (): PerfilTipado => ({
    datos: null,
    formulario: {
        usuario: { name: "usuario", value: "" },
        nombre: { name: "nombre", value: "" },
        apellido: { name: "apellido", value: "" },
        correo: { name: "correo", value: "" },
        celular: { name: "celular", value: "" },
        contrasena_actual: { name: "contrasena_actual", value: "" },
        nueva_contrasena: { name: "nueva_contrasena", value: "" },
        confirmar_contrasena: { name: "confirmar_contrasena", value: "" },
    },
    carga: {
        inicial: true,
        guardar: false,
    },
    error: {
        inicial: null,
        guardar: null,
        campo: {},
    },
    exito: false,
});

/* ==========================================================================
   ACCIONES
   ========================================================================== */

export type PerfilAction =
    // Carga inicial (GET)
    | { type: "SET_DATOS"; payload: PerfilCompleto }
    | { type: "SET_CARGA_INICIAL"; payload: boolean }
    | { type: "SET_ERROR_INICIAL"; payload: string | null }

    // Formulario
    | { type: "SET_CAMPO_FORM"; payload: { campo: CampoFormularioKey; valor: string } }
    | { type: "RESET_FORM" }
    | { type: "SET_ERROR_CAMPO"; payload: { campo: CampoFormularioKey; valor: string | null } }

    // Guardar (PUT)
    | { type: "SET_CARGA_GUARDAR"; payload: boolean }
    | { type: "SET_ERROR_GUARDAR"; payload: string | null }
    | { type: "SET_EXITO"; payload: boolean }

    // Actualizar datos tras guardado exitoso
    | { type: "ACTUALIZAR_DATOS"; payload: MiPerfilResult };

/* ==========================================================================
   REDUCER
   ========================================================================== */

/**
 * Reducer del perfil de usuario.
 * Maneja: carga inicial, edición de campos, guardado con validación.
 */
export const PerfilReducers = (
    state: PerfilTipado,
    action: PerfilAction
): PerfilTipado => {

    switch (action.type) {

        /* ==================================================================
           CARGA INICIAL (GET /api/usuario_perfil)
           ================================================================== */

        case "SET_DATOS": {
            const d = action.payload;
            return {
                ...state,
                datos: d,
                // Rellenar formulario con datos del server
                formulario: {
                    ...state.formulario,
                    usuario: { name: "usuario", value: d.usuario },
                    nombre: { name: "nombre", value: d.nombre },
                    apellido: { name: "apellido", value: d.apellido },
                    correo: { name: "correo", value: d.correo ?? "" },
                    celular: { name: "celular", value: d.celular ?? "" },
                    contrasena_actual: { name: "contrasena_actual", value: "" },
                    nueva_contrasena: { name: "nueva_contrasena", value: "" },
                    confirmar_contrasena: { name: "confirmar_contrasena", value: "" },
                },
                carga: { ...state.carga, inicial: false },
                error: { ...state.error, inicial: null },
            };
        }

        case "SET_CARGA_INICIAL":
            return {
                ...state,
                carga: { ...state.carga, inicial: action.payload },
            };

        case "SET_ERROR_INICIAL":
            return {
                ...state,
                error: { ...state.error, inicial: action.payload },
                carga: { ...state.carga, inicial: false },
            };

        /* ==================================================================
           FORMULARIO
           ================================================================== */

        case "SET_CAMPO_FORM": {
            const { campo, valor } = action.payload;
            // Limpiar error del campo al escribir
            const nuevosErroresCampo = { ...state.error.campo };
            delete nuevosErroresCampo[campo];

            return {
                ...state,
                formulario: {
                    ...state.formulario,
                    [campo]: {
                        ...state.formulario[campo],
                        value: valor,
                    },
                },
                error: {
                    ...state.error,
                    campo: nuevosErroresCampo,
                },
                exito: false, // Limpiar éxito al editar
            };
        }

        case "RESET_FORM":
            return {
                ...state,
                formulario: initialPerfil().formulario,
                error: {
                    ...state.error,
                    campo: {},
                    guardar: null,
                },
                exito: false,
            };

        case "SET_ERROR_CAMPO": {
            const { campo, valor } = action.payload;
            return {
                ...state,
                error: {
                    ...state.error,
                    campo: {
                        ...state.error.campo,
                        [campo]: valor,
                    },
                },
            };
        }

        /* ==================================================================
           GUARDAR (PUT /api/usuario_perfil)
           ================================================================== */

        case "SET_CARGA_GUARDAR":
            return {
                ...state,
                carga: { ...state.carga, guardar: action.payload },
                exito: false,
            };

        case "SET_ERROR_GUARDAR":
            return {
                ...state,
                error: { ...state.error, guardar: action.payload },
                carga: { ...state.carga, guardar: false },
            };

        case "SET_EXITO":
            return {
                ...state,
                exito: action.payload,
                error: { ...state.error, guardar: null },
                carga: { ...state.carga, guardar: false },
                // Limpiar campos de contraseña tras éxito
                formulario: action.payload
                    ? {
                        ...state.formulario,
                        contrasena_actual: { name: "contrasena_actual", value: "" },
                        nueva_contrasena: { name: "nueva_contrasena", value: "" },
                        confirmar_contrasena: { name: "confirmar_contrasena", value: "" },
                    }
                    : state.formulario,
            };

        case "ACTUALIZAR_DATOS": {
            const r = action.payload;
            return {
                ...state,
                datos: state.datos
                    ? { ...state.datos, usuario: r.usuario, rol: r.rol, id_escuela: r.id_escuela }
                    : null,
                formulario: {
                    ...state.formulario,
                    usuario: { name: "usuario", value: r.usuario },
                },
            };
        }

        default:
            return state;
    }
};