import { useReducer } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RutasProtegidasContext } from "../../contexto/protectRutas";

import {
    PerfilReducers,
    initialPerfil,
    type PerfilAction,
    type CampoFormularioKey,
    CAMPOS_OBLIGATORIOS,
} from "../../reducers/perfil.reducer";
import { useEffectServicio } from "../../utils/useEfectServicio";
import type { PerfilCompleto, MiPerfilResult, MiPerfilInputs } from "../../servicio/usuario.perfil.fetch";

/** Tipos de los servicios inyectados (patrón del proyecto) */
type ServicioGet = (signal?: AbortSignal) => Promise<{ error: boolean; data?: PerfilCompleto; message?: string; code?: string }>;
type ServicioPut = (data: MiPerfilInputs, signal?: AbortSignal) => Promise<{ error: boolean; data?: MiPerfilResult; message?: string; code?: string }>;

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
     */
    const guardarPerfil = async () => {
        const f = state.formulario;

        // Validación obligatoria en cliente
        const faltantes = CAMPOS_OBLIGATORIOS.filter((c) => !f[c.campo].value.trim());

        if (faltantes.length > 0) {
            dispatch({
                type: "SET_ERROR_GUARDAR",
                payload: `Completá ${faltantes.map((c) => c.etiqueta).join(", ")}.`,
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

        // Validar email si se llena
        if (f.correo.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.value)) {
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
                contrasena_actual: f.contrasena_actual.value,
            };

            // Solo enviar campos que cambiaron (el server ignora undefined)
            const datosOriginales = state.datos;
            if (datosOriginales) {
                if (f.usuario.value.trim() !== datosOriginales.usuario) {
                    payload.nuevo_usuario = f.usuario.value.trim();
                }
                if (f.correo.value.trim() !== (datosOriginales.correo ?? "")) {
                    payload.correo = f.correo.value.trim();
                }
                if (f.celular.value.trim() !== (datosOriginales.celular ?? "")) {
                    payload.celular = f.celular.value.trim() || undefined;
                }
                if (f.nueva_contrasena.value) {
                    payload.nueva_contrasena = f.nueva_contrasena.value;
                }
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
                    campoError = "correo";
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