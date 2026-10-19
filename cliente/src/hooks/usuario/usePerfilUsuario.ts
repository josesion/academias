import { useReducer, useCallback } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RutasProtegidasContext } from "../../contexto/protectRutas";

import {
    PerfilReducers,
    initialPerfil,
    type PerfilAction,
    type CampoFormularioKey,
    type FormularioPerfil,
    CAMPOS_OBLIGATORIOS,
} from "../../reducers/perfil.reducer";
import { useEffectServicio } from "../../utils/useEfectServicio";
import type { PerfilCompleto, MiPerfilResult, MiPerfilInputs } from "../../servicio/usuario.perfil.fetch";

/** Tipos de los servicios inyectados (patrón del proyecto) */
type ServicioGet = (signal?: AbortSignal) => Promise<{ error: boolean; data?: PerfilCompleto; message?: string; code?: string }>;
/**
 * `errorsDetails` viaja como `unknown` porque el server lo devuelve como
 * `object` sin forma garantizada → se normaliza con un type guard defensivo
 * (`leerDetalles`) antes de usarlo (spec 036, decisión #10b).
 */
type ServicioPut = (data: MiPerfilInputs, signal?: AbortSignal) => Promise<{ error: boolean; data?: MiPerfilResult; message?: string; code?: string; errorsDetails?: unknown }>;

/** Detalle de validación devuelto por el server en `errorsDetails`. */
type DetalleValidacion = { campo: string; message: string };

/**
 * Lee `errorsDetails` como `unknown` y devuelve SOLO los detalles legibles.
 * Si no es un array, o los elementos no tienen `campo`/`message` string,
 * devuelve un array vacío (el llamador cae en el mensaje genérico).
 */
const leerDetalles = (valor: unknown): DetalleValidacion[] => {
    if (!Array.isArray(valor)) return [];
    return valor.filter(
        (d): d is DetalleValidacion =>
            !!d && typeof d === "object" &&
            typeof (d as DetalleValidacion).campo === "string" &&
            typeof (d as DetalleValidacion).message === "string"
    );
};

/**
 * Indica si el nombre de campo recibido por el server corresponde a una clave
 * real del formulario (para poder pintarle un error de campo).
 */
const esCampoFormulario = (campo: string, formulario: FormularioPerfil): campo is CampoFormularioKey =>
    Object.prototype.hasOwnProperty.call(formulario, campo);

interface PropsPerfil {
    servicios: {
        getMiPerfil: ServicioGet;
        putMiPerfil: ServicioPut;
    };
}

/**
 * Lógica del perfil de usuario: carga inicial (GET) y guardado (PUT).
 * Usa el mismo patrón que `useLogicaUsuarios` pero simplificado para
 * una sola entidad (el usuario logueado).
 * Exporta todo lo que el componente necesita: estado + handlers + helpers.
 */
export const useLogicaPerfil = (config: PropsPerfil) => {

    const { rol, setRol, setUsuarioInfo } = useContext(RutasProtegidasContext);
    const navigate = useNavigate();

    /**
     * True si el rol del usuario logueado es "alumno".
     * Para alumno: el campo "correo" está oculto en el formulario y su valor en el
     * PUT sale SIEMPRE del campo "usuario" (spec 036). `rol` puede ser `null`.
     */
    const esAlumno = rol?.rol === "alumno";

    const [state, dispatch] = useReducer(PerfilReducers, initialPerfil());

    /* ======================================================================
       1. CARGA INICIAL (GET /api/usuario_perfil)
       Se dispara al montar (dependencias: []).
       ====================================================================== */

    useEffectServicio<undefined, PerfilCompleto, PerfilAction>({
        dispatch,
        servicios: config.servicios.getMiPerfil,
        accionResultado: (datos) => ({ type: "SET_DATOS", payload: datos! }),
        accionCarga:     (carga) => ({ type: "SET_CARGA_INICIAL", payload: carga }),
        accionError:     (msg)   => ({ type: "SET_ERROR_INICIAL", payload: msg }),
        useAbort: true,
        dependencias: [],
    });

    /* ======================================================================
       2. HANDLERS DEL FORMULARIO
       ====================================================================== */

    /**
     * Guarda lo que se escribe en UNA celda del formulario.
     * Sirve para `<Inputs>` (ChangeEvent de input) y selects.
     */
    const cachearFormulario = useCallback((
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;

        dispatch({
            type: "SET_CAMPO_FORM",
            payload: {
                campo: name as CampoFormularioKey,
                valor: value,
            },
        });
    }, []);

    /**
     * Valida campos obligatorios y envía el PUT.
     * Maneja: loading, errores de validación, errores del server, éxito.
     * Se llama desde el botón Guardar (onClick) — el componente pone e.preventDefault() en el form.
     *
     * Por rol (spec 036): para alumno `correo` no es obligatorio (se filtra aquí,
     * sin tocar el reducer) y el payload siempre lleva `correo` = valor del
     * campo "usuario".
     *
     * Decisión #10 (spec 036, Fase 7 — revierte la decisión #4): para alumno el
     * campo "usuario" **sí** se valida con la regex de email **antes** de
     * cualquier request (el payload de alumno siempre manda `correo` = usuario,
     * así que el server rechazaría igual un usuario que no es email). Si no
     * matchea, se corta con error en el campo "usuario" + alerta global, sin
     * llamar al servicio.
     *
     * Además, el handler de errores contempla el código `VALIDATION_ERROR`
     * leyendo `errorsDetails` (type guard defensivo): si el server manda
     * detalles legibles, se muestra el mensaje real del primer detalle
     * (mapeando "correo" → "usuario" para alumno); si no, se mantiene el
     * mensaje genérico actual.
     */
    const guardarPerfil = async () => {
        const f = state.formulario;

        // Validación obligatoria en cliente (usuario y correo; para alumno el
        // correo NO aplica porque es el propio usuario — el reducer no se toca)
        const obligatorios = CAMPOS_OBLIGATORIOS.filter(
            (c) => !(esAlumno && c.campo === "correo")
        );
        const faltantes = obligatorios.filter((c) => !f[c.campo].value.trim());

        if (faltantes.length > 0) {
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: `Completá ${faltantes.map((c) => c.etiqueta).join(", ")}.`,
            });
            return;
        }

        // Spec 036 (decisión #10, Fase 7): para alumno el campo "usuario" debe
        // ser un correo electrónico válido. El payload de alumno SIEMPRE manda
        // `correo` = usuario, así que si el usuario no es email el server
        // respondería VALIDATION_ERROR: se corta acá, sin request.
        if (esAlumno && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.usuario.value.trim())) {
            dispatch({
                type: "SET_ERROR_CAMPO",
                payload: { campo: "usuario", valor: "El usuario debe ser un correo electrónico válido" },
            });
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: "El usuario debe ser un correo electrónico válido",
            });
            return;
        }

        // Validar coincidencia de contraseñas nuevas
        if (f.nueva_contrasena.value && f.nueva_contrasena.value !== f.confirmar_contrasena.value) {
            dispatch({
                type: "SET_ERROR_CAMPO",
                payload: { campo: "confirmar_contrasena", valor: "Las contraseñas no coinciden" },
            });
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: "Las contraseñas no coinciden",
            });
            return;
        }

        // Validar longitud de nueva contraseña si se llena
        if (f.nueva_contrasena.value && f.nueva_contrasena.value.length < 8) {
            dispatch({
                type: "SET_ERROR_CAMPO",
                payload: { campo: "nueva_contrasena", valor: "Mínimo 8 caracteres" },
            });
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: "La nueva contraseña debe tener al menos 8 caracteres",
            });
            return;
        }

        // Validar email si se llena (solo usuario/admin: para alumno el campo
        // "correo" está oculto y no participa en la validación — spec 036)
        if (!esAlumno && f.correo.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.value)) {
            dispatch({
                type: "SET_ERROR_CAMPO",
                payload: { campo: "correo", valor: "Formato de correo inválido" },
            });
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: "Correo inválido",
            });
            return;
        }

        // Validar contraseña actual SOLO si hay cambio de contraseña
        const hayCambioPassword = f.nueva_contrasena.value.length > 0;
        if (hayCambioPassword && !f.contrasena_actual.value.trim()) {
            dispatch({
                type: "SET_ERROR_CAMPO",
                payload: { campo: "contrasena_actual", valor: "La contraseña actual es requerida para cambiar la contraseña" },
            });
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: "La contraseña actual es requerida para cambiar la contraseña",
            });
            return;
        }

        // Validar longitud de nueva contraseña si se llena
        if (hayCambioPassword && f.nueva_contrasena.value.length < 8) {
            dispatch({
                type: "SET_ERROR_CAMPO",
                payload: { campo: "nueva_contrasena", valor: "Mínimo 8 caracteres" },
            });
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: "La nueva contraseña debe tener al menos 8 caracteres",
            });
            return;
        }

        // Validar email si se llena (solo usuario/admin: para alumno el campo
        // "correo" está oculto y no participa en la validación — spec 036)
        if (!esAlumno && f.correo.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.value)) {
            dispatch({
                type: "SET_ERROR_CAMPO",
                payload: { campo: "correo", valor: "Formato de correo inválido" },
            });
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: "Correo inválido",
            });
            return;
        }

        try {
            dispatch({ type: "SET_ERROR_GUARDAR", payload: null });
            dispatch({ type: "SET_CARGA_GUARDAR", payload: true });

            const payload: MiPerfilInputs = {
                // Solo enviar contraseña actual si hay cambio de contraseña
                contrasena_actual: hayCambioPassword ? f.contrasena_actual.value : undefined,
            };

            // Solo enviar campos que cambiaron (el server ignora undefined)
            const datosOriginales = state.datos;
            if (datosOriginales) {
                if (f.usuario.value.trim() !== datosOriginales.usuario) {
                    payload.nuevo_usuario = f.usuario.value.trim();
                }
                // Alumno: el campo "correo" está oculto, mantiene el valor del GET
                // y NO participa en la comparación (spec 036) — su valor se fuerza
                // más abajo con el campo "usuario".
                if (!esAlumno && f.correo.value.trim() !== (datosOriginales.correo ?? "")) {
                    payload.correo = f.correo.value.trim();
                }
                if (f.celular.value.trim() !== (datosOriginales.celular ?? "")) {
                    payload.celular = f.celular.value.trim() || undefined;
                }
                if (hayCambioPassword) {
                    payload.nueva_contrasena = f.nueva_contrasena.value;
                }
            }

            // Verificar si hay al menos un cambio real para enviar.
            // El "correo" que se fuerza para alumno NO cuenta como cambio:
            // sin ningún otro cambio sigue cortando con "No hay cambios para guardar".
            const hayCambiosReales = 
                payload.nuevo_usuario !== undefined ||
                payload.celular !== undefined ||
                payload.nueva_contrasena !== undefined ||
                (!esAlumno && payload.correo !== undefined);

            if (!hayCambiosReales) {
                dispatch({
                    type: "SET_ERROR_GUARDAR",
                    payload: "No hay cambios para guardar",
                });
                dispatch({ type: "SET_CARGA_GUARDAR", payload: false });
                return;
            }

            // Spec 036 (decisión #1): para alumno SIEMPRE se envía
            // correo = valor del campo "usuario", en todo PUT (aunque solo
            // cambie celular o contraseña). Sincroniza alumnos antiguos.
            if (esAlumno) {
                payload.correo = f.usuario.value.trim();
            }

            const resultado = await config.servicios.putMiPerfil(payload);

            if (resultado.error === false && resultado.data) {
                // Éxito
                dispatch({ type: "SET_EXITO", payload: true });
                dispatch({ type: "ACTUALIZAR_DATOS", payload: resultado.data });

                // Si cambió el username, actualizar contexto
                if (payload.nuevo_usuario && resultado.data.usuario !== rol?.usuario) {
                    const nuevoRol = {
                        ...rol!,
                        usuario: resultado.data.usuario,
                    };
                    setRol(nuevoRol);
                    setUsuarioInfo({ usuario: resultado.data.usuario, error: false });
                }

                // Volver a la página anterior tras guardar exitosamente
                navigate(-1);

            } else {
                // Mapear códigos de error
                const code = resultado.code;
                let mensaje = resultado.message || "Error al guardar los cambios";
                let campoError: CampoFormularioKey | null = null;

                if (code === "INVALID_PASSWORD") {
                    mensaje = "La contraseña actual es incorrecta";
                    campoError = "contrasena_actual";
                } else if (code === "USERNAME_TAKEN") {
                    mensaje = "Ese nombre de usuario ya está en uso";
                    campoError = "usuario";
                } else if (code === "EMAIL_TAKEN") {
                    mensaje = "Ese correo ya está registrado";
                    // Alumno: el campo "correo" está oculto → el error se muestra
                    // sobre el campo visible "usuario" (+ alerta global — spec 036)
                    campoError = esAlumno ? "usuario" : "correo";
                } else if (esAlumno && code === "USERNAME_MUST_BE_EMAIL") {
                    // El server exige que el username de un alumno sea email;
                    // el campo "correo" está oculto → va al campo visible "usuario"
                    mensaje = resultado.message || "El usuario debe ser un correo válido";
                    campoError = "usuario";
                } else if (code === "VALIDATION_ERROR") {
                    // Spec 036 (decisión #10, Fase 7): el server manda
                    // `errorsDetails` con el detalle real de la validación.
                    // Se leen defensivamente; si no hay detalles legibles se
                    // mantiene el mensaje genérico actual.
                    const detalle = leerDetalles(resultado.errorsDetails)[0];
                    if (detalle) {
                        mensaje = detalle.message;
                        // Alumno: el campo "correo" está oculto → el detalle se
                        // muestra sobre el campo visible "usuario".
                        const campoDetalle =
                            esAlumno && detalle.campo === "correo" ? "usuario" : detalle.campo;
                        // Solo se pinta error de campo si corresponde a una clave
                        // real del formulario; si no, queda solo la alerta global.
                        if (esCampoFormulario(campoDetalle, state.formulario)) {
                            campoError = campoDetalle;
                        }
                    }
                }

                if (campoError) {
                    dispatch({
                        type: "SET_ERROR_CAMPO",
                        payload: { campo: campoError, valor: mensaje },
                    });
                }
                dispatch({ type: "SET_ERROR_GUARDAR", payload: mensaje });
            }

        } catch {
            dispatch({ type: "SET_ERROR_GUARDAR", payload: "Error de conexión. Intenta de nuevo." });
        } finally {
            dispatch({ type: "SET_CARGA_GUARDAR", payload: false });
        }
    };

    /**
     * Limpia la alerta de éxito.
     */
    const limpiarExito = () => {
        dispatch({ type: "SET_EXITO", payload: false });
    };

    /* ======================================================================
       3. HELPERS PARA EL COMPONENTE (sin lógica en el componente)
       ====================================================================== */

    const getValor = (campo: CampoFormularioKey) => state.formulario[campo].value;

    const getError = (campo: CampoFormularioKey) => state.error.campo[campo];

    const tieneError = (campo: CampoFormularioKey) => !!state.error.campo[campo];

    /**
     * Wrapper para onChange que despacha SET_CAMPO_FORM.
     * El componente solo llama: onChange={handleChange("usuario")}
     */
    const handleChange = (campo: CampoFormularioKey) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            cachearFormulario({ ...e, target: { ...e.target, name: campo } });
        };

    /**
     * Handler del submit del form.
     * El componente pone: onSubmit={e => { e.preventDefault(); handleSubmit(); }}
     */
    const handleSubmit = () => {
        guardarPerfil();
    };

    return {
        state,
        cachearFormulario,
        guardarPerfil,
        limpiarExito,
        // Helpers para el componente
        getValor,
        getError,
        tieneError,
        handleChange,
        handleSubmit,
        // Constantes exportadas
        CAMPOS_OBLIGATORIOS,
    };
};