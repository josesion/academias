/* ==========================================================================
   REDUCER DEL CARRUSEL PÚBLICO DE ANUNCIOS (spec 019)

   Es una versión reducida del `anuncios.reducer.ts` del administrador: el
   alumno solo LEE y pagina, no filtra, no alta ni baja. De propósito es otro
   archivo y no una rama del admin, porque si mañana el administrador suma un
   filtro o un campo al formulario, este reducer no se enteraría.

   Bloques:
   1. LISTADO  -> los anuncios que se van mostrando
   2. PAGINACIÓN -> página / límite / total de páginas / TOTAL de filas

   `cargarMas()` AGREGA al array (SET_LISTADO lo reemplaza). Por eso hay dos
   acciones distintas y el reducer no puede "adivinar" cuál es cuál.
   ========================================================================== */

import type {
    FilaAnuncioPublico,
    FiltrosAnunciosPublicosQuery,
} from "../servicio/anuncios.publico.fetch";

/** Identifica el bloque que toca la acción en SET_CARGA / SET_ERROR. */
export type BloqueCarga = "listado";

/**
 * UI del paginador del carrusel.
 *
 * `totalRegistros` es el TOTAL de anuncios en la BD (lo manda el servidor):
 * es lo que permite mostrar "12 de 47". `contadorPagina` es el total de
 * páginas, y es lo que decide si todavía se puede pedir una más.
 */
export interface Paginacion {
    pagina: number;
    limite: number;
    contadorPagina: number;
    totalRegistros: number;
}

export interface AnunciosPublicosTipado {

    /* ---------- 1. LISTADO ---------- */
    filtros: FiltrosAnunciosPublicosQuery;
    listado: FilaAnuncioPublico[];

    /* ---------- 2. PAGINACIÓN ---------- */
    paginacion: Paginacion;

    /* ---------- CLAVES POR BLOQUE ---------- */
    carga: {
        listado: boolean;
    },
    error: {
        listado: string | null;
    },

    // Contador de refresco: cuando sube, el effect vuelve a pedir las filas
    // desde la página 1 (mismo criterio que la spec 005).
    actualizar: number;

    /** `true` mientras hay más páginas por pedir. Corta el carrusel: sin esto
     *  el `IntersectionObserver` seguiría pidiendo páginas vacías al llegar al
     *  final y el servidor contestaría 204 en bucle. */
    hayMas: boolean;
}

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */

export const initialAnunciosPublicos = (): AnunciosPublicosTipado => ({
    filtros: {
        pagina: 1,
        limit: 10,
    },
    listado: [],
    paginacion: {
        pagina: 1,
        limite: 10,
        contadorPagina: 1,
        // 0 = ni siquiera vino la primera tanda todavía.
        totalRegistros: 0,
    },
    carga: {
        listado: false,
    },
    error: {
        listado: null,
    },
    actualizar: 0,
    hayMas: false,
});

/* ==========================================================================
   ACCIONES
   ========================================================================== */

/** Campos del filtro: el carrusel solo pagina, así que solo hay uno utilizable. */
export type CampoFiltroKey = keyof FiltrosAnunciosPublicosQuery;

export type AnunciosPublicosAction =

    /* ---------- 1. LISTADO ---------- */
    | { type: "SET_LISTADO"; payload: FilaAnuncioPublico[] }
    /** AGREGA filas al final (la paginación del carrusel). */
    | { type: "AGREGAR_ANUNCIOS"; payload: FilaAnuncioPublico[] }
    | { type: "SET_CARGA"; payload: { bloque: BloqueCarga; valor: boolean } }
    | { type: "SET_ERROR"; payload: { bloque: BloqueCarga; valor: string | null } }

    /* ---------- 2. PAGINACIÓN ---------- */
    | { type: "SET_PAGINACION"; payload: Partial<Paginacion> }
    // Refresca el listado DESDE la página 1
    | { type: "ACTUALIZAR" }
    | { type: "SET_CAMPO_FILTRO"; payload: { campo: CampoFiltroKey; valor: number } };

/* ==========================================================================
   REDUCER
   ========================================================================== */

/**
 * Reducer del carrusel público de anuncios.
 *
 * @param state - Estado vigente (`initialAnunciosPublicos()` al arrancar).
 * @param action - Acción a aplicar; siempre devuelve un estado nuevo.
 * @returns Estado nuevo con el cambio aplicado.
 */
export const AnunciosPublicosReducers = (
    state: AnunciosPublicosTipado,
    action: AnunciosPublicosAction
): AnunciosPublicosTipado => {

    switch (action.type) {

        /* Al llegar filas nuevas se limpia SU aviso: `useEffectServicio` nunca
           despacha `accionError(null)`, sin esto el error anterior quedaría
           pegado en la pantalla. */
        case "SET_LISTADO":
            return {
                ...state,
                listado: action.payload,
                error: { ...state.error, listado: null },
            };

        /* Agrega al final SIN borrar lo anterior. Es la acción de la
           paginación: el carrusel no reemplaza, acumula. */
        case "AGREGAR_ANUNCIOS": {
            const nuevas = [...state.listado, ...action.payload];

            // `hayMas` se recalcula acá y no en el `SET_PAGINACION` porque es
            // acá donde quedaron las dos cosas que hay que comparar: la página
            // que se acaba de agregar y la cantidad de filas ya acumuladas.
            return {
                ...state,
                listado: nuevas,
                error: { ...state.error, listado: null },
                hayMas: nuevas.length < state.paginacion.totalRegistros,
            };
        }

        case "SET_CARGA":
            return {
                ...state,
                carga: {
                    ...state.carga,
                    [action.payload.bloque]: action.payload.valor,
                },
            };

        case "SET_ERROR":
            return {
                ...state,
                error: {
                    ...state.error,
                    [action.payload.bloque]: action.payload.valor,
                },
            };

        // Recibe la paginación de `ApiResponse` o un parcial: solo lo que viene
        // en el payload pisa el valor actual.
        case "SET_PAGINACION": {
            const paginacion = {
                ...state.paginacion,
                ...action.payload,
            };

            // En la PRIMERA carga (`listado.length === 0`) el total todavía no
            // se usó para calcular `hayMas`, así que se calcula acá. En las
            // siguientes lo calcula `AGREGAR_ANUNCIOS`, que ya tiene las dos
            // mitades del todo.
            const hayMas = state.listado.length === 0
                ? paginacion.totalRegistros > paginacion.limite
                : state.hayMas;

            return {
                ...state,
                paginacion,
                hayMas,
            };
        }

        // Refresco DESDE LA PÁGINA 1: sube el contador y resetea la página en
        // sus dos hogares — `filtros.pagina` (el effect pide `?pagina=1`) y
        // `paginacion.pagina` (el que se muestra).
        case "ACTUALIZAR":
            return {
                ...state,
                actualizar: state.actualizar + 1,
                filtros: {
                    ...state.filtros,
                    pagina: 1,
                },
                paginacion: {
                    ...state.paginacion,
                    pagina: 1,
                },
                // `hayMas` se recalcula con la próxima respuesta
                hayMas: true,
            };

        // Pisa UN campo del filtro (`pagina`). El `as` es necesario porque los
        // filtros mezclan tipos (`pagina`/`limit` son number) y TypeScript no
        // puede narrowing sobre una clave calculada: sin él, el valor sería
        // `never`.
        case "SET_CAMPO_FILTRO":
            return {
                ...state,
                filtros: {
                    ...state.filtros,
                    [action.payload.campo]: action.payload.valor,
                } as FiltrosAnunciosPublicosQuery,
            };

        default:
            return state;
    }
};