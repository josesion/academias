import { useCallback, useEffect, useReducer, useRef } from "react";

import {
  LogoEscuelaReducers,
  initialLogoEscuela,
} from "../../reducers/logoEscuela.reducer";
import type { ApiResponse } from "../../utils/apiFetch";
import type { EscuelaPerfil } from "../../servicio/escuela.perfil.fetch";

/* ==========================================================================
   TIPOS DE LOS SERVICIOS INYECTADOS (patrón del proyecto)
   ========================================================================== */

type ServicioGet = () => Promise<ApiResponse<EscuelaPerfil>>;
type ServicioPut = (file: File) => Promise<ApiResponse<EscuelaPerfil>>;
type ServicioDelete = () => Promise<ApiResponse<EscuelaPerfil>>;

interface PropsLogoEscuela {
  servicios: {
    getEscuelaPerfil: ServicioGet;
    putLogoEscuela: ServicioPut;
    deleteLogoEscuela: ServicioDelete;
  };
}

/* ==========================================================================
   CONSTANTES DE VALIDACIÓN PREVIA (solo ayuda: el server revalida)
   ========================================================================== */

/** Formatos aceptados por el servidor. SVG queda afuera a propósito. */
const FORMATOS_VALIDOS = ["image/jpeg", "image/png", "image/webp"];

/** Tope de 2 MB, igual que el logo del ABM de escuelas. */
const TAMANO_MAXIMO = 2 * 1024 * 1024;

const MENSAJE_FORMATO_INVALIDO =
  "Formato no válido. Elegí un archivo JPG, PNG o WEBP.";
const MENSAJE_TAMANO_INVALIDO = "La imagen supera el tamaño máximo de 2 MB.";
const MENSAJE_ERROR_CONEXION =
  "No se pudo procesar la operación. Intentá de nuevo.";

/**
 * Lógica de la sección "Logo de mi escuela".
 *
 * Hace cuatro cosas:
 * 1. Carga inicial de la escuela (`GET /api/usuario_perfil/escuela`). Un fallo
 *    acá **no** rompe la página: el error se guarda solo para esta sección.
 * 2. Validación previa del archivo (formato y 2 MB) sin llamar al server.
 * 3. Manejo del blob URL de la vista previa: se crea al elegir y se revoca al
 *    reemplazar, al guardar/quitado con éxito y al desmontar (sin fugas).
 * 4. Guardado (`PUT` multipart) y quitado (`DELETE`) con corte por doble clic,
 *    conservando el archivo elegido si el server responde con error.
 *
 * @param config - Servicios inyectados desde `hookNegocios/abmLogoEscuela.ts`
 * @returns `state` del reducer + handlers de la sección
 */
export const useLogoEscuela = (config: PropsLogoEscuela) => {

  const { getEscuelaPerfil, putLogoEscuela, deleteLogoEscuela } = config.servicios;

  const [state, dispatch] = useReducer(LogoEscuelaReducers, initialLogoEscuela());

  /** Última blob URL creada: es la que hay que revocar. */
  const previewRef = useRef<string | null>(null);

  /** Cortes sincrónicos de doble clic (el estado reacciona un render después). */
  const guardandoRef = useRef(false);
  const quitandoRef = useRef(false);

  /**
   * Revoca la blob URL vigente (si hay) y limpia la referencia.
   * Revocar dos veces la misma URL es inocuo.
   */
  const revocarPreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  }, []);

  /* ======================================================================
     1. CARGA INICIAL (GET /api/usuario_perfil/escuela)
     ====================================================================== */

  useEffect(() => {
    let vigente = true;

    const cargar = async () => {
      dispatch({ type: "CARGAR_INICIO" });

      try {
        const resultado = await getEscuelaPerfil();

        // El componente se desmontó: la respuesta ya no interesa.
        if (!vigente) return;

        if (resultado.error === false && resultado.data) {
          dispatch({ type: "CARGAR_OK", payload: resultado.data });
        } else {
          dispatch({
            type: "CARGAR_ERROR",
            payload: resultado.message || "No se pudo cargar el logo de tu escuela.",
          });
        }
      } catch {
        if (vigente) {
          dispatch({ type: "CARGAR_ERROR", payload: MENSAJE_ERROR_CONEXION });
        }
      }
    };

    cargar();

    return () => {
      vigente = false;
    };
  }, [getEscuelaPerfil]);

  /* ======================================================================
     2. LIMPIEZA DEL BLOB URL AL DESMONTAR
     ====================================================================== */

  useEffect(() => {
    return () => revocarPreview();
  }, [revocarPreview]);

  /* ======================================================================
     3. SELECCIÓN DEL ARCHIVO (validación previa, sin server)
     ====================================================================== */

  /**
   * Lee el archivo del input, valida formato y tamaño y arma la vista previa.
   *
   * El `input` se resetea después de leer el `File` para que elegir el mismo
   * archivo dos veces vuelva a disparar `change` (B14).
   *
   * @param event - ChangeEvent del input `type="file"`
   */
  const elegirArchivo = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const archivo = event.target.files?.[0] ?? null;

      // Reset del input ANTES de cualquier salida (B14)
      event.target.value = "";

      if (!archivo) return;

      // Elegir un archivo nuevo descarta el mensaje de éxito anterior.
      dispatch({ type: "LIMPIAR_EXITO" });

      if (!FORMATOS_VALIDOS.includes(archivo.type)) {
        revocarPreview();
        dispatch({ type: "ERROR_ARCHIVO", payload: MENSAJE_FORMATO_INVALIDO });
        return;
      }

      if (archivo.size > TAMANO_MAXIMO) {
        revocarPreview();
        dispatch({ type: "ERROR_ARCHIVO", payload: MENSAJE_TAMANO_INVALIDO });
        return;
      }

      // Reemplazo: primero se libera la vista previa anterior
      revocarPreview();

      const previewUrl = URL.createObjectURL(archivo);
      previewRef.current = previewUrl;

      dispatch({
        type: "ELEGIR_ARCHIVO",
        payload: { archivo, previewUrl },
      });
    },
    [revocarPreview]
  );

  /* ======================================================================
     4. GUARDAR (PUT /api/usuario_perfil/escuela/logo)
     ====================================================================== */

  /**
   * Sube el archivo elegido. Corta si ya hay un guardado en curso o si no hay
   * archivo (doble clic, CA-29).
   *
   * En éxito: guarda la respuesta, suelta el blob y marca "Logo actualizado".
   * En error: conserva el archivo elegido para poder reintentar (CA-26).
   */
  const guardar = useCallback(async () => {
    if (guardandoRef.current || state.carga.guardar || !state.archivo) return;

    guardandoRef.current = true;
    dispatch({ type: "GUARDAR_INICIO", payload: true });

    try {
      const resultado = await putLogoEscuela(state.archivo);

      if (resultado.error === false && resultado.data) {
        revocarPreview();
        dispatch({ type: "GUARDAR_OK", payload: resultado.data });
      } else {
        dispatch({
          type: "GUARDAR_ERROR",
          payload: resultado.message || "No se pudo guardar el logo.",
        });
      }
    } catch {
      // Red de seguridad: apiFetch nunca lanza
      dispatch({ type: "GUARDAR_ERROR", payload: MENSAJE_ERROR_CONEXION });
    } finally {
      guardandoRef.current = false;
      // Idempotente con GUARDAR_OK / GUARDAR_ERROR: deja el botón habilitado
      dispatch({ type: "GUARDAR_INICIO", payload: false });
    }
  }, [state.archivo, state.carga.guardar, putLogoEscuela, revocarPreview]);

  /* ======================================================================
     5. QUITAR (DELETE /api/usuario_perfil/escuela/logo)
     ====================================================================== */

  /** Abre la confirmación en línea (solo si la escuela tiene logo guardado). */
  const confirmarQuitar = useCallback(() => {
    if (state.carga.quitar || !state.datos?.urlImagen) return;
    dispatch({ type: "CONFIRMAR_QUITAR" });
  }, [state.carga.quitar, state.datos]);

  /** Cierra la confirmación sin llamar al server. */
  const cancelarQuitar = useCallback(() => {
    dispatch({ type: "CANCELAR_QUITAR" });
  }, []);

  /**
   * Quita el logo confirmado. Corta si ya hay un quitado en curso.
   *
   * En éxito: deja `urlImagen` en `null`, suelta el blob y marca "Logo quitado".
   * En error: el mensaje del server queda en la región de alerta.
   */
  const quitar = useCallback(async () => {
    if (quitandoRef.current || state.carga.quitar) return;

    quitandoRef.current = true;
    dispatch({ type: "QUITAR_INICIO", payload: true });

    try {
      const resultado = await deleteLogoEscuela();

      if (resultado.error === false && resultado.data) {
        revocarPreview();
        dispatch({ type: "QUITAR_OK", payload: resultado.data });
      } else {
        dispatch({
          type: "QUITAR_ERROR",
          payload: resultado.message || "No se pudo quitar el logo.",
        });
      }
    } catch {
      // Red de seguridad: apiFetch nunca lanza
      dispatch({ type: "QUITAR_ERROR", payload: MENSAJE_ERROR_CONEXION });
    } finally {
      quitandoRef.current = false;
      // Idempotente con QUITAR_OK / QUITAR_ERROR: deja el botón habilitado
      dispatch({ type: "QUITAR_INICIO", payload: false });
    }
  }, [state.carga.quitar, deleteLogoEscuela, revocarPreview]);

  return {
    state,
    elegirArchivo,
    guardar,
    confirmarQuitar,
    cancelarQuitar,
    quitar,
  };
};
