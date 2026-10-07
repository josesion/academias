/* ==========================================================================
   ESTRUCTURA DEL ARCHIVO
   Todo está agrupado por especificidad, con el mismo orden en el tipado,
   el estado inicial, las acciones y el reducer:

   1. FORMULARIO (POST / PUT)  -> alta y edición de una suscripción
   2. CAMBIO DE ESTADO         -> modal de anulación
   3. LISTADO                  -> datos de la tabla, carga, errores, paginación
   4. FILTROS                  -> buscador del listado
   5. MÉTRICAS                 -> tarjetas del panel (GET /api/metricas_simples)

   Nota: los 5 bloques están implementados.
   ========================================================================== */

/* ==========================================================================
   TIPOS AUXILIARES
   ========================================================================== */
import type { SuscripcionEscuelaDto, FiltrosSuscripcionesInputs, EscPlanDTO, MetricasSimples } from "../servicio/suspcripciones.fetch";
import { fechaHoy } from "../utils/fecha";

export interface CeldasInput {
    name: string;
    value: string;
}

export interface Paginacion {
    pagina: number;
    limite: number;
    contadorPagina: number;
}

/* ==========================================================================
   ESTADO
   ========================================================================== */

export interface SuspcripcionesTipado {

    /* ---------- 1. FORMULARIO (POST / PUT) ---------- */
    // carga, error y modal son objetos compartidos: cada bloque tiene su clave
    carga : {
        listado : boolean,
        formulario : boolean,
        opciones : boolean,
        estado : boolean,
        metricas : boolean,
    },
    error : {
        listado : string | null,
        formulario : string | null,
        opciones : string | null,
        estado : string |  null,
        metricas : string | null,
    },
    modal : {
        listado : boolean,
        formulario : boolean,
        estado : boolean,
    },

    metodo : "POST" | "PUT" | null,
    id_suscripcion : number | null,

    // Fila seleccionada para el modal de anulación: guarda de una el id
    // (lo único que pide el fetch), la razón social y el plan (la leyenda)
    seleccionada : SuscripcionEscuelaDto | null,

    formulario : {
        id_escuela : CeldasInput,
        id_plan_saas : CeldasInput,
        fecha_inscripcion : CeldasInput,
        estado : CeldasInput,
    },

    // Opciones de los dos <SelectorOpt>: escuelas activas + planes SaaS activos
    // (GET /api/esc_plan_list). Null hasta que el servidor responde.
    opciones : EscPlanDTO | null,

    /* ---------- 3. LISTADO ---------- */
    filtroSuscripciones : FiltrosSuscripcionesInputs,
    listadoSuspcripcop : SuscripcionEscuelaDto[] |  null,
    paginacion : Paginacion,

    // Contador de refresco: cuando sube, el effect del listado vuelve a pedir
    // los datos. Así se muestra la suscripción recién creada sin pisar filtros.
    actualizar : number,

    /* ---------- 5. MÉTRICAS ---------- */
    // Tarjetas del panel: null hasta que el server responde
    metricas : MetricasSimples | null,
}

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */

export const initialSuspcripciones = (): SuspcripcionesTipado => ({

    /* ---------- 1. FORMULARIO (POST / PUT) ---------- */
    carga : {
        listado : false,
        formulario : false,
        opciones : false,
        estado : false,
        metricas : false,
    },
    error : {
        listado : null,
        formulario : null,
        opciones : null,
        estado :  null,
        metricas : null,
    },
    modal : {
        listado : false,
        formulario : false,
        estado: false,
    },

    metodo : "POST",
    id_suscripcion : null,
    seleccionada : null,

    formulario : {
        id_escuela : { name : "id_escuela", value : "" },
        id_plan_saas : { name : "id_plan_saas", value : "" },
        fecha_inscripcion : { name : "fecha_inscripcion", value : "" },
        estado : { name : "estado", value : "activo" },
    },

    opciones : null,

    /* ---------- 3. LISTADO ---------- */
    filtroSuscripciones : {
        razon_social : "",
        id_plan_saas : "",
        fecha_inscripcion : "",
        estado : "activo",
        limit : 10,
        pagina : 1
    },
    
    listadoSuspcripcop : [],

    paginacion : {
        pagina : 1 , limite : 10 , contadorPagina : 1,
    },

    actualizar : 0,

    /* ---------- 5. MÉTRICAS ---------- */
    metricas : null,

});

/* ==========================================================================
   CONVERSIÓN DE FECHAS
   El DTO del listado trae 'DD/MM/YYYY' (MySQL) y el <input type="date">
   exige 'YYYY-MM-DD'. Si ya viene en ese formato se devuelve tal cual.
   No se exporta: react-refresh/only-export-components no deja exportar
   nada que no sea un componente de este archivo.
   ========================================================================== */

const aFormatoInput = (fecha : string) : string => {
    if (!fecha) return "";
    if (fecha.includes("-")) return fecha;
    return fecha.split("/").reverse().join("-");
};

/* ==========================================================================
   TIPOS AUXILIARES DE LAS ACCIONES
   ========================================================================== */

// Claves de los objetos indexados del estado: permiten que el payload traiga
// el nombre del estado y el valor en un mismo objeto (SET_CARGA / SET_ERROR)
export type CampoCargaKey = keyof SuspcripcionesTipado["carga"];
export type CampoErrorKey = keyof SuspcripcionesTipado["error"];

// Campos del formulario: SET_CAMPO_FORM solo puede pisar una de estas celdas
export type CampoFormularioKey = keyof SuspcripcionesTipado["formulario"];

// Campos del filtro del listado (incluye pagina y limit, que viven adentro)
export type CampoFiltroKey = keyof FiltrosSuscripcionesInputs;

/* ==========================================================================
   ACCIONES
   ========================================================================== */

export type SuspcripcionesAction =

    /* ---------- 1. FORMULARIO (POST / PUT) ---------- */
    | { type: "SET_METODO"; payload: "POST" | "PUT" | null }
    | { type: "ABRIR_MODAL"; payload: "POST" | "PUT" }
    | { type : "ABRIR_MODAL_ESTADO", payload : boolean }
    // Fila seleccionada a anular (id + razón social + plan de una sola vez)
    | { type : "SET_SELECCIONADA"; payload : SuscripcionEscuelaDto | null }
    | { type: "CERRAR_MODAL" }
    | { type: "SET_ID_SUSCRIPCION"; payload: number | null }
    | { type: "SET_CAMPO_FORM"; payload: { campo: CampoFormularioKey; valor: string } }
    | { type: "CARGAR_SUSCRIPCION_EDICION"; payload: SuscripcionEscuelaDto }
    | { type: "RESET_FORM" }
    // Listado de las opciones de los selects (escuelas + planes)
    | { type: "SET_OPCIONES"; payload: EscPlanDTO | null }

    /* ---------- 3. LISTADO ---------- */
    | { type: "SET_LISTADO_SUSCRIPCION"; payload: SuscripcionEscuelaDto[]  | null}
    // carga y error del formulario se setean con estas mismas acciones:
    // payload { campo: "formulario", valor } (habilitado por CampoCargaKey / CampoErrorKey)
    | { type: "SET_CARGA"; payload: { campo: CampoCargaKey; valor: boolean } }
    | { type: "SET_ERROR"; payload: { campo: CampoErrorKey; valor: string | null } }
    | { type: "SET_PAGINACION"; payload: Partial<Paginacion> }
    // Refresca el listado sin tocar los filtros (sube el contador `actualizar`)
    | { type: "ACTUALIZAR" }

    /* ---------- 4. FILTROS ---------- */
    | { type: "SET_CAMPO_FILTRO"; payload: { campo: CampoFiltroKey; valor: string | number } }
    | { type: "RESET_FILTROS" }

    /* ---------- 5. MÉTRICAS ---------- */
    | { type: "SET_METRICAS"; payload: MetricasSimples | null };


/* ==========================================================================
   REDUCER
   ========================================================================== */

export const SuspcripcionesReducers = (
    state: SuspcripcionesTipado,
    action: SuspcripcionesAction
): SuspcripcionesTipado => {

    switch (action.type) {

        /* ==================================================================
           1. FORMULARIO (POST / PUT)
           ================================================================== */

        case "SET_METODO":
            return {
                ...state,
                metodo: action.payload,
            };
        
        case "ABRIR_MODAL_ESTADO":
            return{
                ...state,
                modal :{
                    ...state.modal,
                    estado : action.payload
                }
            }    

        // Guarda (o limpia, con null) la suscripción seleccionada para anular
        case "SET_SELECCIONADA":
            return {
                ...state,
                seleccionada: action.payload,
            };

        case "ABRIR_MODAL":
            return {
                ...state,
                modal: {
                    ...state.modal,
                    formulario: true,
                },
                // setea automáticamente si es POST o PUT al abrir
                metodo: action.payload,
                error: {
                    ...state.error,
                    formulario: null,
                },
                // Fecha de inscripción precargada con hoy (YYYY-MM-DD).
                // El vencimiento lo calcula el server: el front no lo tiene.
                formulario: {
                    ...state.formulario,
                    fecha_inscripcion: {
                        name: "fecha_inscripcion",
                        value: fechaHoy(),
                    },
                },
            };

        case "CERRAR_MODAL":
            return {
                ...state,
                modal: {
                    ...state.modal,
                    formulario: false,
                },
                // Reseteamos el formulario, errores y carga del form,
                // PERO PRESERVAMOS el listado, los filtros y la paginación
                metodo: "POST",
                id_suscripcion: null,
                error: {
                    ...state.error,
                    formulario: null,
                },
                carga: {
                    ...state.carga,
                    formulario: false,
                },
                formulario: initialSuspcripciones().formulario,
            };

        case "SET_ID_SUSCRIPCION":
            return {
                ...state,
                id_suscripcion: action.payload,
            };

        case "SET_CAMPO_FORM":
            return {
                ...state,
                formulario: {
                    ...state.formulario,
                    [action.payload.campo]: {
                        ...state.formulario[action.payload.campo],
                        value: action.payload.valor,
                    },
                },
            };

        // Precarga del formulario al editar: recibe la fila del listado
        // y la deja lista para el PUT (fechas convertidas a YYYY-MM-DD)
        case "CARGAR_SUSCRIPCION_EDICION":
            return {
                ...state,
                metodo: "PUT",
                id_suscripcion: action.payload.id_suscripcion ?? null,
                error: {
                    ...state.error,
                    formulario: null,
                },
                formulario: {
                    id_escuela: {
                        name: "id_escuela",
                        value: String(action.payload.id_escuela ?? ""),
                    },
                    id_plan_saas: {
                        name: "id_plan_saas",
                        value: String(action.payload.id_plan_saas ?? ""),
                    },
                    fecha_inscripcion: {
                        name: "fecha_inscripcion",
                        value: aFormatoInput(action.payload.fecha_inscripcion),
                    },
                    estado: {
                        name: "estado",
                        value: action.payload.estado_suscripcion || "activo",
                    },
                },
            };

        case "RESET_FORM":
            return {
                ...state,
                metodo: "POST",
                id_suscripcion: null,
                error: {
                    ...state.error,
                    formulario: null,
                },
                carga: {
                    ...state.carga,
                    formulario: false,
                },
                formulario: initialSuspcripciones().formulario,
                // el modal queda como estaba: RESET_FORM limpia datos, no vista
                modal: {
                    ...state.modal,
                    formulario: false,
                },
            };

        // Opciones de los selects del formulario: llegan juntas en un solo
        // objeto ({ escuelas, planes_saas }); null = todavía no se pidieron
        case "SET_OPCIONES":
            return {
                ...state,
                opciones: action.payload,
            };

        /* ==================================================================
           3. LISTADO
           ================================================================== */

        case "SET_LISTADO_SUSCRIPCION":
            return {
                ...state,
                listadoSuspcripcop: action.payload,
            };

        case "SET_CARGA":
            return {
                ...state,
                carga: {
                    ...state.carga,
                    [action.payload.campo]: action.payload.valor,
                },
            };

        case "SET_ERROR":
            return {
                ...state,
                error: {
                    ...state.error,
                    [action.payload.campo]: action.payload.valor,
                },
            };

        // Recibe el objeto paginacion de ApiResponse ({ pagina, limite, contadorPagina })
        // o un parcial: solo lo que viene en el payload pisa el valor actual
        case "SET_PAGINACION":
            return {
                ...state,
                paginacion: {
                    ...state.paginacion,
                    ...action.payload,
                },
            };

        // Refresco del listado DESDE LA PÁGINA 1 (alta, anulación o cambio
        // de filtro): sube el contador y resetea la página en sus dos hogares
        // — la de los filtros (el effect pide ?pagina=1) y la del paginador.
        // Las 3 despachadas salen batched: un solo request.
        case "ACTUALIZAR":
            return {
                ...state,
                actualizar: state.actualizar + 1,
                filtroSuscripciones: {
                    ...state.filtroSuscripciones,
                    pagina: 1,
                },
                paginacion: {
                    ...state.paginacion,
                    pagina: 1,
                },
            };

        /* ==================================================================
           4. FILTROS
           ================================================================== */

        case "SET_CAMPO_FILTRO":
            return {
                ...state,
                filtroSuscripciones: {
                    ...state.filtroSuscripciones,
                    [action.payload.campo]: action.payload.valor,
                },
            };

        case "RESET_FILTROS":
            return {
                ...state,
                // Objeto nuevo en cada reset (no se comparte referencia)
                filtroSuscripciones: initialSuspcripciones().filtroSuscripciones,
            };

        /* ==================================================================
           5. MÉTRICAS
           ================================================================== */

        // Tarjetas del panel: llegan juntas; null limpia si algo falló
        case "SET_METRICAS":
            return {
                ...state,
                metricas: action.payload,
            };

        default:
            return state;
    }
};
