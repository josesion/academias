import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

import { generarRangoUnaHora } from "./setHora";
import { useEffectServicio } from "../utils/useEfectServicio";
import { recepcionComunicacion } from "../utils/canalComunicacion";
import { useActualizarAlEnfocar } from "../utils/useActulizarFocus";

import { mensajeErrorTemporal } from "./mensajeTemporales";
import { useNotificaciones } from "../contexto/notificaciones.context";
import { initialState, horariosGymReducer, type HorarioGymAction } from "../reducers/horariosGymReducers";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

import type * as TipadoHorarioGym from "../tipadosTs/horario_gym";
import { type ClaseHorario } from "../componentes/Horarios/ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../componentes/Horarios/CeldaVacia/CeldaVacia";

interface HorarioGymConfig {
    servicios: {
        listadoProfesores: ServicioCrud;
        listadoSalas: ServicioCrud;
        listadoTipo: ServicioCrud;
        calendarioGym: ServicioCrud;
        altaHorarioGym: ServicioCrud;
        modHorarioGym: ServicioCrud;
        eliminarHorarioGym: ServicioCrud;
        HORARIOS: TipadoHorarioGym.Horas[];
        DIAS_SEMANA: TipadoHorarioGym.DiaSemana[];
    };
    inicialFiltroProfesor: { dni: string };
    inicialFiltroSala?: { nombre?: string };
    inicialFiltroTipo: { tipo: string };
}

export const useHorarioGymHook = (config: HorarioGymConfig) => {
    const irA = useNavigate();
    const api = useNotificaciones();
    const [state, dispatch] = useReducer(horariosGymReducer, initialState());

    const setErrorGenericoAdapter = (error: string | null) => {
        dispatch({ type: "SET_ERROR", payload: error });
    };

    const horarios: TipadoHorarioGym.Horas[] = config.servicios.HORARIOS;
    const diasSemana: TipadoHorarioGym.DiaSemana[] = config.servicios.DIAS_SEMANA;

    // ──────────────────────────────────────────────────────────────
    // Handles para cachear selecciones
    // ──────────────────────────────────────────────────────────────

    const handleCachearProfesores = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: "SET_FILTRO_BUSQUEDA_PROFESOR",
            payload: { ...state.filtroBusquedaProfesor, [e.target.name]: e.target.value },
        });
        const dniProfesor = e.target.value;
        const profeSeleccionado = state.listaProfe.find((profe) => profe.Dni === dniProfesor);
        if (profeSeleccionado) {
            dispatch({ type: "SET_PROFESORES", payload: profeSeleccionado });
            dispatch({
                type: "SET_CONJUNTO_ID_HORARIO",
                payload: { ...state.conjuntoIDHorario, dni_profe: profeSeleccionado.Dni },
            });
            dispatch({
                type: "SET_DATA_FORM_HORARIO",
                payload: { ...state.dataFormHorario, dni_profesor: profeSeleccionado.Dni },
            });
            dispatch({
                type: "SET_DATA_MOD_HORARIO",
                payload: { ...state.dataModHorario, dni_profesor: profeSeleccionado.Dni },
            });
        } else {
            dispatch({ type: "SET_PROFESORES", payload: null });
            dispatch({
                type: "SET_CONJUNTO_ID_HORARIO",
                payload: { ...state.conjuntoIDHorario, dni_profe: null },
            });
            dispatch({
                type: "SET_DATA_FORM_HORARIO",
                payload: { ...state.dataFormHorario, dni_profesor: null },
            });
            dispatch({
                type: "SET_DATA_MOD_HORARIO",
                payload: { ...state.dataModHorario, dni_profesor: null },
            });
        }
    };

    const handleCachearSalas = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: "SET_FILTRO_BUSQUEDA_SALA",
            payload: { ...state.filtroBusquedaSala, [e.target.name]: e.target.value },
        });
        const salaSeleccionada = state.listaSalas.find((sala) => sala.nombre === e.target.value);
        if (salaSeleccionada) {
            dispatch({ type: "SET_SALA", payload: salaSeleccionada });
            dispatch({
                type: "SET_CONJUNTO_ID_HORARIO",
                payload: { ...state.conjuntoIDHorario, id_sala: salaSeleccionada.id },
            });
            dispatch({
                type: "SET_DATA_FORM_HORARIO",
                payload: { ...state.dataFormHorario, id_sala: salaSeleccionada.id },
            });
            dispatch({
                type: "SET_DATA_MOD_HORARIO",
                payload: { ...state.dataModHorario, id_sala: salaSeleccionada.id },
            });
        } else {
            dispatch({ type: "SET_SALA", payload: null });
            dispatch({
                type: "SET_CONJUNTO_ID_HORARIO",
                payload: { ...state.conjuntoIDHorario, id_sala: null },
            });
            dispatch({
                type: "SET_DATA_FORM_HORARIO",
                payload: { ...state.dataFormHorario, id_sala: null },
            });
            dispatch({
                type: "SET_DATA_MOD_HORARIO",
                payload: { ...state.dataModHorario, id_sala: null },
            });
        }
    };

    const handleCachearTipos = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: "SET_FILTRO_BUSQUEDA_TIPO",
            payload: { ...state.filtroBusquedaTipo, [e.target.name]: e.target.value },
        });
        const tipoSeleccionado = state.listaTipo.find((tipo) => tipo.tipo === e.target.value);
        if (tipoSeleccionado) {
            dispatch({ type: "SET_TIPO", payload: tipoSeleccionado });
            dispatch({
                type: "SET_CONJUNTO_ID_HORARIO",
                payload: { ...state.conjuntoIDHorario, id_tipo_clase: tipoSeleccionado.id },
            });
            dispatch({
                type: "SET_DATA_FORM_HORARIO",
                payload: { ...state.dataFormHorario, id_tipo_clase: tipoSeleccionado.id },
            });
            dispatch({
                type: "SET_DATA_MOD_HORARIO",
                payload: { ...state.dataModHorario, id_tipo_clase: tipoSeleccionado.id },
            });
        } else {
            dispatch({ type: "SET_TIPO", payload: null });
            dispatch({
                type: "SET_CONJUNTO_ID_HORARIO",
                payload: { ...state.conjuntoIDHorario, id_tipo_clase: null },
            });
            dispatch({
                type: "SET_DATA_FORM_HORARIO",
                payload: { ...state.dataFormHorario, id_tipo_clase: null },
            });
            dispatch({
                type: "SET_DATA_MOD_HORARIO",
                payload: { ...state.dataModHorario, id_tipo_clase: null },
            });
        }
    };

    // ──────────────────────────────────────────────────────────────
    // Handles para abrir/cerrar modal
    // ──────────────────────────────────────────────────────────────

    const handleAbrirModificarHorario = (clase: ClaseHorario) => {
        dispatch({ type: "SET_MODAL_INTERNO", payload: true });
        dispatch({ type: "SET_METODO", payload: "MOD" });
        if (clase.dni_profe) {
            dispatch({
                type: "SET_PROFESORES",
                payload: { Dni: clase.dni_profe, Apellido: clase.profesor, Nombre: clase.nombre },
            });
        }
        if (clase.sala_nombre) {
            dispatch({
                type: "SET_SALA",
                payload: { id: clase.id_sala, nombre: clase.sala_nombre, capacidad: null },
            });
        }
        if (clase.id_clase) {
            dispatch({ type: "SET_TIPO", payload: { id: clase.id_clase, tipo: clase.tipo_clase } });
        }
        dispatch({
            type: "SET_HORARIOFIN",
            payload: {
                hora_inicio: clase.hora_inicio as TipadoHorarioGym.Horas,
                hora_fin: clase.hora_fin as TipadoHorarioGym.Horas,
            },
        });
        dispatch({ type: "SET_DIA_HORARIO", payload: clase.dia as TipadoHorarioGym.DiaSemana });
        dispatch({
            type: "SET_DATA_MOD_HORARIO",
            payload: {
                ...state.dataModHorario,
                id: clase.id_horario,
                dni_profesor: clase.dni_profe || null,
                id_sala: clase.id_sala,
                id_tipo_clase: clase.id_clase || null,
            },
        });
        dispatch({
            type: "SET_DATA_ELIMINAR_HORARIO",
            payload: { ...state.dataEliminarHorario, id: clase.id_horario },
        });
    };

    const handleAbrirModal = (mensaje: MensajeCelda) => {
        if (mensaje.mensaje === "+") {
            const { hora_fin, hora_inicio } = generarRangoUnaHora(mensaje.hora);
            dispatch({ type: "SET_MODAL_INTERNO", payload: true });
            dispatch({ type: "SET_HORARIOFIN", payload: generarRangoUnaHora(mensaje.hora) });
            dispatch({ type: "SET_DIA_HORARIO", payload: mensaje.dia });
            dispatch({ type: "SET_METODO", payload: "ALTA" });
            // Setear id_sala automáticamente desde la sala seleccionada
            const idSala = state.salaSeleccionada?.id ?? null;
            dispatch({
                type: "SET_DATA_FORM_HORARIO",
                payload: {
                    ...state.dataFormHorario,
                    dia_semana: mensaje.dia,
                    hora_inicio,
                    hora_fin,
                    id_sala: idSala,
                },
            });
            dispatch({ type: "SET_CONJUNTO_ID_HORARIO", payload: { ...state.conjuntoIDHorario, id_sala: idSala } });
        }
    };

    const handleCerrarModal = () => {
        dispatch({ type: "SET_MODAL_INTERNO", payload: false });
        dispatch({ type: "SET_PROFESORES", payload: null });
        dispatch({ type: "SET_SALA", payload: null });
        dispatch({ type: "SET_TIPO", payload: null });
        dispatch({
            type: "SET_CONJUNTO_ID_HORARIO",
            payload: {
                dni_profe: null,
                id_sala: null,
                id_tipo_clase: null,
                id_horario: null,
            },
        });
    };

    const handleVolver = () => {
        dispatch({ type: "SET_MODAL_HORARIO", payload: false });
        irA("/user_manager_priv");
    };

    // ──────────────────────────────────────────────────────────────
    // Alta, Modificación y Eliminación
    // ──────────────────────────────────────────────────────────────

    const handleAltaHorario = async () => {
        try {
            dispatch({ type: "SET_CARGA", payload: { campo: "abm", valor: true } });

            if (!state.listoEnviar) {
                const mensajeBase = state.errorGenericoHorario as string;
                return mensajeErrorTemporal({
                    tiempo: 3,
                    mensajeError: "Faltan campos verificar",
                    mensajeEspera: mensajeBase,
                    setErrorGenerico: setErrorGenericoAdapter,
                });
            }

            const servicioApiFetch = config.servicios.altaHorarioGym;
            const resultadoAlta = await servicioApiFetch(state.dataFormHorario);

            if (resultadoAlta.error === true) {
                dispatch({ type: "SET_ERROR", payload: resultadoAlta.message });
                return;
            }

            dispatch({ type: "SET_ACTUALIZAR", payload: !state.actualizar });
            dispatch({ type: "RESET_FORMULARIO" });
            dispatch({ type: "SET_MODAL_INTERNO", payload: false });
            api.exito("Horario creado exitosamente");
        } catch {
            dispatch({ type: "SET_ERROR", payload: "Error en carga de datos" });
        } finally {
            dispatch({ type: "SET_CARGA", payload: { campo: "abm", valor: false } });
        }
    };

    const handleModHorario = async () => {
        try {
            dispatch({ type: "SET_CARGA", payload: { campo: "abm", valor: true } });

            if (!state.listoEnviar) {
                const mensajeBase = state.errorGenericoHorario as string;
                return mensajeErrorTemporal({
                    tiempo: 3,
                    mensajeError: "Faltan campos verificar",
                    mensajeEspera: mensajeBase,
                    setErrorGenerico: setErrorGenericoAdapter,
                });
            }

            const servicioApiFetch = config.servicios.modHorarioGym;
            const resultadoMod = await servicioApiFetch(state.dataModHorario);

            if (resultadoMod.error === true) {
                dispatch({ type: "SET_ERROR", payload: resultadoMod.message });
                return;
            }

            dispatch({ type: "SET_ACTUALIZAR", payload: !state.actualizar });
            dispatch({ type: "RESET_FORMULARIO" });
            dispatch({ type: "SET_MODAL_INTERNO", payload: false });
            api.exito("Horario modificado exitosamente");
        } catch {
            dispatch({ type: "SET_ERROR", payload: "Error en carga de datos" });
        } finally {
            dispatch({ type: "SET_CARGA", payload: { campo: "abm", valor: false } });
        }
    };

    const handleEliminarHorario = async () => {
        try {
            dispatch({ type: "SET_CARGA", payload: { campo: "abm", valor: true } });

            const servicioApiFetch = config.servicios.eliminarHorarioGym;
            const resultadoEliminar = await servicioApiFetch(state.dataEliminarHorario);

            if (resultadoEliminar.error === true) {
                dispatch({ type: "SET_ERROR", payload: resultadoEliminar.message });
                return;
            }

            dispatch({ type: "SET_ACTUALIZAR", payload: !state.actualizar });
            dispatch({ type: "RESET_FORMULARIO" });
            dispatch({ type: "SET_MODAL_INTERNO", payload: false });
            api.exito("Horario eliminado exitosamente");
        } catch {
            dispatch({ type: "SET_ERROR", payload: "Error en carga de datos" });
        } finally {
            dispatch({ type: "SET_CARGA", payload: { campo: "abm", valor: false } });
        }
    };

    // ──────────────────────────────────────────────────────────────
    // Carga de listas desde API
    // ──────────────────────────────────────────────────────────────

    useEffectServicio<any, any[], HorarioGymAction>({
        valores: state.filtroBusquedaProfesor,
        servicios: config.servicios.listadoProfesores,
        dispatch,
        accionResultado: (data) => ({ type: "SET_LISTADO_PROFESORES", payload: data || [] }),
        accionError: (mensaje) => ({ type: "SET_ERROR", payload: mensaje }),
        accionCarga: (estado) => ({ type: "SET_CARGA", payload: { campo: "profesores", valor: estado } }),
        useAbort: true,
        ignorarCancelados: true,
        dependencias: [state.filtroBusquedaProfesor],
    });

    useEffectServicio<any, any[], HorarioGymAction>({
        valores: config.inicialFiltroSala || { nombre: "" },
        servicios: config.servicios.listadoSalas,
        dispatch,
        accionResultado: (data) => ({ type: "SET_LISTADO_SALAS", payload: data || [] }),
        accionError: (mensaje) => ({ type: "SET_ERROR", payload: mensaje }),
        accionCarga: (estado) => ({ type: "SET_CARGA", payload: { campo: "salas", valor: estado } }),
        useAbort: true,
        ignorarCancelados: true,
        dependencias: [state.filtroBusquedaSala.nombre],
    });

    useEffectServicio<any, any[], HorarioGymAction>({
        valores: state.filtroBusquedaTipo,
        servicios: config.servicios.listadoTipo,
        dispatch,
        accionResultado: (data) => ({ type: "SET_LISTADO_TIPO", payload: data || [] }),
        accionError: (mensaje) => ({ type: "SET_ERROR", payload: mensaje }),
        accionCarga: (estado) => ({ type: "SET_CARGA", payload: { campo: "tipos", valor: estado } }),
        useAbort: true,
        ignorarCancelados: true,
        dependencias: [state.filtroBusquedaTipo],
    });

    useEffectServicio<any, TipadoHorarioGym.ClaseHorarioGymData[], HorarioGymAction>({
        valores: config.servicios.calendarioGym,
        servicios: config.servicios.calendarioGym,
        dispatch,
        accionResultado: (data) => ({ type: "SET_CALENDARIO", payload: data || [] }),
        accionError: (mensaje) => ({ type: "SET_ERROR", payload: mensaje }),
        accionCarga: (estado) => ({ type: "SET_CARGA", payload: { campo: "calendario", valor: estado } }),
        useAbort: true,
        ignorarCancelados: true,
        dependencias: [state.actualizar, state.actualizarGenerico],
    });

    // ──────────────────────────────────────────────────────────────
    // Validación: id_sala es obligatorio, profesor y tipo opcionales
    // ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (state.metodo === "MOD") {
            dispatch({ type: "SET_ERROR", payload: "Puede modificar los datos o guardar" });
            dispatch({ type: "SET_ENVIAR", payload: true });
            return;
        }

        if (!state.conjuntoIDHorario.id_sala) {
            // Sala es implícita (seleccionada en la página), no se valida aquí
            dispatch({ type: "SET_ERROR", payload: "Seleccionar una sala" });
            dispatch({ type: "SET_ENVIAR", payload: false });
        } else {
            dispatch({ type: "SET_ERROR", payload: "Listo para Guardar." });
            dispatch({ type: "SET_ENVIAR", payload: true });
        }
    }, [state.conjuntoIDHorario, state.metodo]);

    // ──────────────────────────────────────────────────────────────
    // Canales de comunicación
    // ──────────────────────────────────────────────────────────────

    useEffect(() => {
        const canalProfesor = recepcionComunicacion({
            nombreCanal: "Profesor_canal",
            mensaje: "actualizar",
            dispatchError: dispatch,
            error: "SET_ERROR_ACTUALIZAR",
            dispatchActualizar: dispatch,
            actualizar: "ACTUALIZAR_GENERICO",
        });
        const canalTipo = recepcionComunicacion({
            nombreCanal: "Tipo_canal",
            mensaje: "actualizar",
            dispatchError: dispatch,
            error: "SET_ERROR_ACTUALIZAR",
            dispatchActualizar: dispatch,
            actualizar: "ACTUALIZAR_GENERICO",
        });

        return () => {
            if (canalProfesor) canalProfesor();
            if (canalTipo) canalTipo();
        };
    }, []);

    useActualizarAlEnfocar({ dispatchActualizar: dispatch, accion: "ACTUALIZAR_GENERICO" });

    // ──────────────────────────────────────────────────────────────
    // Seleccionar sala como contexto principal
    // ──────────────────────────────────────────────────────────────
    const handleSeleccionarSala = (sala: TipadoHorarioGym.DataSala | null) => {
        dispatch({ type: "SET_SALA_SELECCIONADA", payload: sala });
        if (sala) {
            dispatch({ type: "SET_CONJUNTO_ID_HORARIO", payload: { ...state.conjuntoIDHorario, id_sala: sala.id } });
            dispatch({ type: "SET_DATA_FORM_HORARIO", payload: { ...state.dataFormHorario, id_sala: sala.id } });
            dispatch({ type: "SET_DATA_MOD_HORARIO", payload: { ...state.dataModHorario, id_sala: sala.id } });
        } else {
            dispatch({ type: "SET_CONJUNTO_ID_HORARIO", payload: { ...state.conjuntoIDHorario, id_sala: null } });
            dispatch({ type: "SET_DATA_FORM_HORARIO", payload: { ...state.dataFormHorario, id_sala: null } });
            dispatch({ type: "SET_DATA_MOD_HORARIO", payload: { ...state.dataModHorario, id_sala: null } });
        }
    };

    return {
        state,
        horarios,
        diasSemana,
        handleCachearProfesores,
        handleCachearSalas,
        handleCachearTipos,
        handleSeleccionarSala,
        handleModHorario,
        handleAbrirModal,
        handleAbrirModificarHorario,
        handleCerrarModal,
        handleAltaHorario,
        handleEliminarHorario,
        handleVolver,
    };
};
