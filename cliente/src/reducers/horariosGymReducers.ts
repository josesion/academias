import type * as TipadoHorarioGym from "../tipadosTs/horario_gym";
import { type ResultHoras } from "../hooks/setHora";
import { fechaHoy } from "../utils/fecha";

// ==========================================
// 1. DEFINICIÓN DEL ESTADO (MOLDE)
// ==========================================
export interface HorarioGymCarga {
    profesores: boolean;
    salas: boolean;
    tipos: boolean;
    calendario: boolean;
    abm: boolean;
}

export interface HorarioGymTipado {
    errorActualizar: string | null;
    errorGenericoHorario: string | null;
    carga: HorarioGymCarga;
    modalInterno: boolean;
    modalHorario: boolean;
    metodo: TipadoHorarioGym.metodo | null;

    // Profesores
    profesores: TipadoHorarioGym.DataProfesor | null;
    listaProfe: TipadoHorarioGym.DataProfesor[];

    // Salas
    sala: TipadoHorarioGym.DataSala | null;
    listaSalas: TipadoHorarioGym.DataSala[];

    // Tipos
    tipo: TipadoHorarioGym.DataTipo | null;
    listaTipo: TipadoHorarioGym.DataTipo[];

    // Calendario
    calendario: TipadoHorarioGym.ClaseHorarioGymData[];

    // Tarjeta
    horaInicioFin: ResultHoras | null;
    diaHorario: TipadoHorarioGym.DiaSemana | null;

    // Formularios
    dataFormHorario: {
        dni_profesor: string | null;
        id_sala: number | null;
        id_tipo_clase: number | null;
        hora_inicio: TipadoHorarioGym.Horas | null;
        hora_fin: TipadoHorarioGym.Horas | null;
        dia_semana: TipadoHorarioGym.DiaSemana | null;
        fecha_creacion: string;
        estado: string;
        modulo: string;
    };
    dataModHorario: {
        dni_profesor: string | null;
        id_sala: number | null;
        id_tipo_clase: number | null;
        id: number | null;
    };
    dataEliminarHorario: {
        id: number | null;
        estado: "activos" | "inactivos" | "suspendido";
        vigente: boolean;
    };
    conjuntoIDHorario: {
        dni_profe: string | null;
        id_sala: number | null;
        id_tipo_clase: number | null;
        id_horario?: number | null;
    };

    // Filtros
    filtroBusquedaProfesor: TipadoHorarioGym.FiltroProfesor;
    filtroBusquedaSala: TipadoHorarioGym.FiltroSala;
    filtroBusquedaTipo: TipadoHorarioGym.FiltroTipo;
    filtroCalendario: TipadoHorarioGym.CalendarioGym;
    /** Sala elegida como contexto principal. `null` = aún no seleccionada. */
    salaSeleccionada: TipadoHorarioGym.DataSala | null;

    // Validación
    listoEnviar: boolean;
    actualizar: boolean;
    actualizarGenerico: number;
}

// ==========================================
// 2. ESTADO INICIAL
// ==========================================
export const initialState = (): HorarioGymTipado => ({
    errorActualizar: null,
    errorGenericoHorario: null,
    carga: {
        profesores: false,
        salas: false,
        tipos: false,
        calendario: false,
        abm: false,
    },
    modalInterno: false,
    modalHorario: false,
    metodo: null,

    profesores: null,
    listaProfe: [],

    sala: null,
    listaSalas: [],

    tipo: null,
    listaTipo: [],

    calendario: [],

    horaInicioFin: null,
    diaHorario: null,

    dataFormHorario: {
        dni_profesor: null,
        id_sala: null,
        id_tipo_clase: null,
        hora_inicio: null,
        hora_fin: null,
        dia_semana: null,
        fecha_creacion: fechaHoy(),
        estado: "activos",
        modulo: "HORARIOS",
    },
    dataModHorario: {
        dni_profesor: null,
        id_sala: null,
        id_tipo_clase: null,
        id: null,
    },
    dataEliminarHorario: {
        id: null,
        estado: "inactivos",
        vigente: false,
    },
    conjuntoIDHorario: {
        dni_profe: null,
        id_sala: null,
        id_tipo_clase: null,
        id_horario: null,
    },

    filtroBusquedaProfesor: { dni: "", estado: "activos" },
    filtroBusquedaSala: { nombre: "", estado: "activos" },
    filtroBusquedaTipo: { tipo: "", estado: "activos" },
    filtroCalendario: { estado: "activos" },
    salaSeleccionada: null,

    listoEnviar: false,
    actualizar: false,
    actualizarGenerico: 0,
});

// ==========================================
// 3. ACCIONES
// ==========================================
export type HorarioGymAction =
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_CARGA"; payload: { campo: keyof HorarioGymCarga; valor: boolean } }
    | { type: "SET_MODAL_INTERNO"; payload: boolean }
    | { type: "SET_MODAL_HORARIO"; payload: boolean }
    | { type: "SET_METODO"; payload: TipadoHorarioGym.metodo | null }
    | { type: "SET_ENVIAR"; payload: boolean }
    | { type: "SET_ACTUALIZAR"; payload: boolean }
    | { type: "ACTUALIZAR_GENERICO"; payload: number }

    // Profesores
    | { type: "SET_PROFESORES"; payload: TipadoHorarioGym.DataProfesor | null }
    | { type: "SET_LISTADO_PROFESORES"; payload: TipadoHorarioGym.DataProfesor[] }
    | { type: "SET_FILTRO_BUSQUEDA_PROFESOR"; payload: TipadoHorarioGym.FiltroProfesor }

    // Salas
    | { type: "SET_SALA"; payload: TipadoHorarioGym.DataSala | null }
    | { type: "SET_LISTADO_SALAS"; payload: TipadoHorarioGym.DataSala[] }
    | { type: "SET_FILTRO_BUSQUEDA_SALA"; payload: TipadoHorarioGym.FiltroSala }

    // Tipos
    | { type: "SET_TIPO"; payload: TipadoHorarioGym.DataTipo | null }
    | { type: "SET_LISTADO_TIPO"; payload: TipadoHorarioGym.DataTipo[] }
    | { type: "SET_FILTRO_BUSQUEDA_TIPO"; payload: TipadoHorarioGym.FiltroTipo }

    // Calendario
    | { type: "SET_CALENDARIO"; payload: TipadoHorarioGym.ClaseHorarioGymData[] }
    | { type: "SET_FILTRO_CALENDARIO"; payload: TipadoHorarioGym.CalendarioGym }
    | { type: "SET_SALA_SELECCIONADA"; payload: TipadoHorarioGym.DataSala | null }

    // Tarjeta
    | { type: "SET_HORARIOFIN"; payload: ResultHoras | null }
    | { type: "SET_DIA_HORARIO"; payload: TipadoHorarioGym.DiaSemana | null }

    // Formularios
    | { type: "SET_DATA_FORM_HORARIO"; payload: Partial<HorarioGymTipado["dataFormHorario"]> }
    | { type: "SET_DATA_MOD_HORARIO"; payload: Partial<HorarioGymTipado["dataModHorario"]> }
    | { type: "SET_DATA_ELIMINAR_HORARIO"; payload: Partial<HorarioGymTipado["dataEliminarHorario"]> }
    | { type: "SET_CONJUNTO_ID_HORARIO"; payload: Partial<HorarioGymTipado["conjuntoIDHorario"]> }

    // Reset
    | { type: "RESET_FORMULARIO" }
    | { type: "SET_ERROR_ACTUALIZAR"; payload: string | null };

// ==========================================
// 4. REDUCER
// ==========================================
export const horariosGymReducer = (
    state: HorarioGymTipado,
    action: HorarioGymAction
): HorarioGymTipado => {
    switch (action.type) {
        case "SET_ERROR":
            return { ...state, errorGenericoHorario: action.payload };
        case "SET_ERROR_ACTUALIZAR":
            return { ...state, errorActualizar: action.payload };
        case "SET_CARGA":
            return { ...state, carga: { ...state.carga, [action.payload.campo]: action.payload.valor } };
        case "SET_MODAL_INTERNO":
            return { ...state, modalInterno: action.payload };
        case "SET_MODAL_HORARIO":
            return { ...state, modalHorario: action.payload };
        case "SET_METODO":
            return { ...state, metodo: action.payload };
        case "SET_ENVIAR":
            return { ...state, listoEnviar: action.payload };
        case "SET_ACTUALIZAR":
            return { ...state, actualizar: action.payload };
        case "ACTUALIZAR_GENERICO":
            return { ...state, actualizarGenerico: action.payload };

        case "SET_PROFESORES":
            return { ...state, profesores: action.payload };
        case "SET_LISTADO_PROFESORES":
            return { ...state, listaProfe: action.payload };
        case "SET_FILTRO_BUSQUEDA_PROFESOR":
            return { ...state, filtroBusquedaProfesor: action.payload };

        case "SET_SALA":
            return { ...state, sala: action.payload };
        case "SET_LISTADO_SALAS":
            return { ...state, listaSalas: action.payload };
        case "SET_FILTRO_BUSQUEDA_SALA":
            return { ...state, filtroBusquedaSala: action.payload };

        case "SET_TIPO":
            return { ...state, tipo: action.payload };
        case "SET_LISTADO_TIPO":
            return { ...state, listaTipo: action.payload };
        case "SET_FILTRO_BUSQUEDA_TIPO":
            return { ...state, filtroBusquedaTipo: action.payload };

        case "SET_CALENDARIO":
            return { ...state, calendario: action.payload };
        case "SET_FILTRO_CALENDARIO":
            return { ...state, filtroCalendario: action.payload };
        case "SET_SALA_SELECCIONADA":
            return { ...state, salaSeleccionada: action.payload };

        case "SET_HORARIOFIN":
            return { ...state, horaInicioFin: action.payload };
        case "SET_DIA_HORARIO":
            return { ...state, diaHorario: action.payload };

        case "SET_DATA_FORM_HORARIO":
            return { ...state, dataFormHorario: { ...state.dataFormHorario, ...action.payload } };
        case "SET_DATA_MOD_HORARIO":
            return { ...state, dataModHorario: { ...state.dataModHorario, ...action.payload } };
        case "SET_DATA_ELIMINAR_HORARIO":
            return { ...state, dataEliminarHorario: { ...state.dataEliminarHorario, ...action.payload } };
        case "SET_CONJUNTO_ID_HORARIO":
            return { ...state, conjuntoIDHorario: { ...state.conjuntoIDHorario, ...action.payload } };

        case "RESET_FORMULARIO":
            return {
                ...state,
                profesores: null,
                sala: null,
                tipo: null,
                horaInicioFin: null,
                diaHorario: null,
                conjuntoIDHorario: {
                    dni_profe: null,
                    id_sala: null,
                    id_tipo_clase: null,
                    id_horario: null,
                },
                dataFormHorario: {
                    dni_profesor: null,
                    id_sala: null,
                    id_tipo_clase: null,
                    hora_inicio: null,
                    hora_fin: null,
                    dia_semana: null,
                    fecha_creacion: fechaHoy(),
                    estado: "activos",
                    modulo: "HORARIOS",
                },
                dataModHorario: {
                    dni_profesor: null,
                    id_sala: null,
                    id_tipo_clase: null,
                    id: null,
                },
                dataEliminarHorario: {
                    id: null,
                    estado: "inactivos",
                    vigente: false,
                },
                // NO resetear salaSeleccionada: es el contexto principal de la página
            };

        default:
            return state;
    }
};
