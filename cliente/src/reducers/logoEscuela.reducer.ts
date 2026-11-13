/* ==========================================================================
   REDUCER DEL LOGO DE LA ESCUELA
   Estado de la sección "Logo de mi escuela" del perfil: datos de la escuela,
   archivo elegido, vista previa, carga, errores, éxito y confirmación de
   quitado. Las transiciones son las 14 acciones de la spec 051 (F2.1).
   ========================================================================== */

import type { EscuelaPerfil } from "../servicio/escuela.perfil.fetch";

/* ==========================================================================
   TIPOS
   ========================================================================== */

/** Estado completo de la sección del logo. */
export interface LogoEscuelaTipado {
  /** Escuela del token tal como la devolvió el server (`null` antes del GET) */
  datos: EscuelaPerfil | null;

  /** Archivo elegido y todavía sin guardar (`null` = no hay nada pendiente) */
  archivo: File | null;

  /** Blob URL del archivo elegido (`null` = se muestra el logo guardado) */
  previewUrl: string | null;

  /** Flags de carga por bloque */
  carga: {
    inicial: boolean;
    guardar: boolean;
    quitar: boolean;
  };

  /** Errores por bloque + error de campo del input de archivo */
  error: {
    inicial: string | null;
    guardar: string | null;
    quitar: string | null;
    campo: string | null;
  };

  /** Mensaje de éxito para la región `role="status"` (`null` = vacía) */
  exito: string | null;

  /** `true` = se está mostrando la confirmación en línea de "Quitar logo" */
  confirmandoQuitar: boolean;
}

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */

/**
 * Estado de fábrica de la sección: sin datos, sin archivo y con la carga
 * inicial en curso (el hook dispara el GET al montar).
 *
 * @returns Un estado nuevo (no se comparte entre renders)
 */
export const initialLogoEscuela = (): LogoEscuelaTipado => ({
  datos: null,
  archivo: null,
  previewUrl: null,
  carga: {
    inicial: true,
    guardar: false,
    quitar: false,
  },
  error: {
    inicial: null,
    guardar: null,
    quitar: null,
    campo: null,
  },
  exito: null,
  confirmandoQuitar: false,
});

/* ==========================================================================
   ACCIONES
   ========================================================================== */

export type LogoEscuelaAction =
  // Carga inicial (GET /api/usuario_perfil/escuela)
  | { type: "CARGAR_INICIO" }
  | { type: "CARGAR_OK"; payload: EscuelaPerfil }
  | { type: "CARGAR_ERROR"; payload: string }

  // Selección de archivo (validada antes en el hook)
  | { type: "ELEGIR_ARCHIVO"; payload: { archivo: File; previewUrl: string } }
  | { type: "ERROR_ARCHIVO"; payload: string }

  // Guardar (PUT /api/usuario_perfil/escuela/logo)
  | { type: "GUARDAR_INICIO"; payload: boolean }
  | { type: "GUARDAR_OK"; payload: EscuelaPerfil }
  | { type: "GUARDAR_ERROR"; payload: string }

  // Confirmación en línea y quitado (DELETE /api/usuario_perfil/escuela/logo)
  | { type: "CONFIRMAR_QUITAR" }
  | { type: "CANCELAR_QUITAR" }
  | { type: "QUITAR_INICIO"; payload: boolean }
  | { type: "QUITAR_OK"; payload: EscuelaPerfil }
  | { type: "QUITAR_ERROR"; payload: string }

  // Región de estado
  | { type: "LIMPIAR_EXITO" };

/* ==========================================================================
   REDUCER
   ========================================================================== */

/**
 * Reducer de la sección del logo de la escuela.
 *
 * `GUARDAR_INICIO` y `QUITAR_INICIO` llevan `payload: boolean` para que el
 * `finally` del hook pueda apagar el flag sin una acción extra de "fin".
 *
 * @param state - Estado actual
 * @param action - Transición a aplicar
 * @returns El estado nuevo (o el mismo si la acción no corresponde)
 */
export const LogoEscuelaReducers = (
  state: LogoEscuelaTipado,
  action: LogoEscuelaAction
): LogoEscuelaTipado => {

  switch (action.type) {

    /* ==================================================================
       CARGA INICIAL (GET /api/usuario_perfil/escuela)
       ================================================================== */

    case "CARGAR_INICIO":
      return {
        ...state,
        carga: { ...state.carga, inicial: true },
        error: { ...state.error, inicial: null },
      };

    case "CARGAR_OK":
      return {
        ...state,
        datos: action.payload,
        carga: { ...state.carga, inicial: false },
        error: { ...state.error, inicial: null },
      };

    case "CARGAR_ERROR":
      return {
        ...state,
        carga: { ...state.carga, inicial: false },
        error: { ...state.error, inicial: action.payload },
      };

    /* ==================================================================
       SELECCIÓN DE ARCHIVO
       ================================================================== */

    case "ELEGIR_ARCHIVO":
      return {
        ...state,
        archivo: action.payload.archivo,
        previewUrl: action.payload.previewUrl,
        error: { ...state.error, campo: null, guardar: null },
        exito: null,
      };

    case "ERROR_ARCHIVO":
      return {
        ...state,
        archivo: null,
        previewUrl: null,
        error: { ...state.error, campo: action.payload },
        exito: null,
      };

    /* ==================================================================
       GUARDAR (PUT /api/usuario_perfil/escuela/logo)
       ================================================================== */

    case "GUARDAR_INICIO":
      return {
        ...state,
        carga: { ...state.carga, guardar: action.payload },
        // Al arrancar se limpian los avisos; al terminar (false) se conservan
        error: action.payload
          ? { ...state.error, guardar: null, campo: null }
          : state.error,
        exito: action.payload ? null : state.exito,
      };

    case "GUARDAR_OK":
      return {
        ...state,
        datos: action.payload,
        archivo: null,
        previewUrl: null,
        carga: { ...state.carga, guardar: false },
        error: { ...state.error, guardar: null, campo: null },
        exito: "Logo actualizado",
      };

    case "GUARDAR_ERROR":
      return {
        ...state,
        carga: { ...state.carga, guardar: false },
        error: { ...state.error, guardar: action.payload },
      };

    /* ==================================================================
       CONFIRMACIÓN Y QUITADO (DELETE /api/usuario_perfil/escuela/logo)
       ================================================================== */

    case "CONFIRMAR_QUITAR":
      return {
        ...state,
        confirmandoQuitar: true,
        error: { ...state.error, quitar: null },
        exito: null,
      };

    case "CANCELAR_QUITAR":
      return {
        ...state,
        confirmandoQuitar: false,
      };

    case "QUITAR_INICIO":
      return {
        ...state,
        carga: { ...state.carga, quitar: action.payload },
        error: action.payload
          ? { ...state.error, quitar: null }
          : state.error,
        exito: action.payload ? null : state.exito,
      };

    case "QUITAR_OK":
      return {
        ...state,
        datos: action.payload,
        archivo: null,
        previewUrl: null,
        confirmandoQuitar: false,
        carga: { ...state.carga, quitar: false },
        error: { ...state.error, quitar: null, guardar: null, campo: null },
        exito: "Logo quitado",
      };

    case "QUITAR_ERROR":
      return {
        ...state,
        carga: { ...state.carga, quitar: false },
        error: { ...state.error, quitar: action.payload },
      };

    /* ==================================================================
       REGIÓN DE ESTADO
       ================================================================== */

    case "LIMPIAR_EXITO":
      return {
        ...state,
        exito: null,
      };

    default:
      return state;
  }
};
