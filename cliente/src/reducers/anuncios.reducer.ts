/* ==========================================================================
   ESTRUCTURA DEL ARCHIVO
   Todo está agrupado por especificidad, con el mismo orden en el tipado, el
   estado inicial, las acciones y el reducer:

   1. LISTADO             -> anuncios paginados (GET /api/anuncio_lista)
   2. OPCIONES            -> empresas del selector del formulario
                             (GET /api/empresa_lista?limit=100)
   3. FORMULARIO          -> alta (POST /api/anuncio_alta) y modificación
                             (PUT /api/anuncio_mod)
   4. CONFIRMACIÓN DE BAJA -> la baja es FÍSICA (borra el archivo de R2), así
                             que sí o sí pasa por el `EliminarVentana`

   La media es un `File`, no un string: por eso tiene su propia acción
   (`SET_MEDIA`) en vez de entrar en el patrón genérico `{campo, valor}`.

   `carga` y `error` se indexan con `BloqueCarga` (los 4 bloques de arriba).
   ========================================================================== */

/* ==========================================================================
   TIPOS AUXILIARES
   ========================================================================== */

import type {
    FilaAnuncio,
    FiltrosAnunciosQuery,
} from "../servicio/anuncios.fetch";
// Empresas del selector: mismo tipo que devuelve el listado de empresas
import type { FilaEmpresa } from "../servicio/empresas.fetch";
// Celdas del formulario: mismo tipo que el de suscripciones y cuentas
// (decisión de proyecto: los tipos del form viven en `reducers/suspcripciones.ts`)
import type { CeldasInput } from "./suspcripciones";

/** Identifica el bloque que toca la acción en SET_CARGA / SET_ERROR. */
export type BloqueCarga = "listado" | "opciones" | "formulario" | "eliminar";

/** UI del paginador: `pagina` es la que se muestra, `contadorPagina` es el
 *  total de páginas que manda el server (`ApiResponse.paginacion`). */
export interface Paginacion {
    pagina: number;
    limite: number;
    contadorPagina: number;
}

/* ==========================================================================
   ESTADO
   ========================================================================== */

export interface AnunciosTipado {

    /* ---------- 1. LISTADO ---------- */
    filtros: FiltrosAnunciosQuery;
    listado: FilaAnuncio[];
    paginacion: Paginacion;
    // Contador de refresco: cuando sube, el effect vuelve a pedir las filas
    // desde la página 1 (mismo criterio que la spec 005).
    actualizar: number;

    /* ---------- 2. OPCIONES ---------- */
    // Empresas del <SelectorOpt> del formulario (GET /api/empresa_lista).
    // Viene con los 4 filtros de la empresa, pero el selector solo usa el id y
    // la razón social.
    empresas: FilaEmpresa[];

    /* ---------- CLAVES POR BLOQUE ---------- */
    carga: {
        listado: boolean;
        opciones: boolean;
        formulario: boolean;
        eliminar: boolean;
    },
    error: {
        listado: string | null;
        opciones: string | null;
        formulario: string | null;
        eliminar: string | null;
    },
    // Los 2 modales de la pantalla: el del formulario (alta y modificación) y
    // la confirmación de baja.
    modal: {
        formulario: boolean;
        eliminar: boolean;
    },

    /* ---------- 3. FORMULARIO ---------- */
    // ¿En qué modo está abierto el form? POST = alta, PUT = modificación.
    // Lo fija ABRIR_MODAL / CARGAR_ANUNCIO_EDICION y lo limpia CERRAR_MODAL.
    metodo: "POST" | "PUT" | null,
    // Anuncio a modificar: id que sale de la fila del listado y viaja en el PUT.
    id_anuncio: number | null,
    // Fila completa del anuncio que se está editando. Solo la usa el form para
    // mostrar la media actual en la vista previa (un `File` no se puede
    // recuperar de una URL, así que sin esto no se vería nada al abrir).
    anuncioEnEdicion: FilaAnuncio | null,
    formulario: {
        id_empresa: CeldasInput;
        titulo: CeldasInput;
        descripcion: CeldasInput;
        tipo_contacto: CeldasInput;
    },
    // Media nueva elegida en el form. `null` = no se eligió ninguna.
    //
    // En el ALTA es obligatoria (el server responde 400 MEDIA_AUSENTE si no
    // llega). En la MODIFICACIÓN es opcional: `null` significa "no toques la
    // media", que es lo que hace el servidor si el FormData no trae el campo.
    media: File | null;

    /* ---------- 4. CONFIRMACIÓN DE BAJA ---------- */
    // Anuncio cuya baja se está por confirmar. `null` = no hay ninguno abierto.
    anuncioAEliminar: FilaAnuncio | null;
}

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */

export const initialAnuncios = (): AnunciosTipado => ({

    /* ---------- 1. LISTADO ---------- */
    filtros: {
        pagina: 1,
        limit: 6,
        // Los 4 filtros arrancan sin definir = sin filtrar
    },
    listado: [],
    paginacion: {
        pagina: 1,
        limite: 6,
        contadorPagina: 1,
    },
    actualizar: 0,

    /* ---------- 2. OPCIONES ---------- */
    empresas: [],

    carga: {
        listado: false,
        opciones: false,
        formulario: false,
        eliminar: false,
    },
    error: {
        listado: null,
        opciones: null,
        formulario: null,
        eliminar: null,
    },
    modal: {
        formulario: false,
        eliminar: false,
    },

    /* ---------- 3. FORMULARIO ---------- */
    metodo: "POST",
    id_anuncio: null,
    anuncioEnEdicion: null,
    formulario: {
        id_empresa: { name: "id_empresa", value: "" },
        titulo: { name: "titulo", value: "" },
        descripcion: { name: "descripcion", value: "" },
        // Arranca en "whatsapp" (decisión de la spec 017): es la red más usada
        // y así el select nunca arranca vacío.
        tipo_contacto: { name: "tipo_contacto", value: "whatsapp" },
    },
    media: null,

    /* ---------- 4. CONFIRMACIÓN DE BAJA ---------- */
    anuncioAEliminar: null,
});

/* ==========================================================================
   TIPOS AUXILIARES DE LAS ACCIONES
   ========================================================================== */

// Campos del filtro: SET_CAMPO_FILTRO solo puede pisar uno de estos
export type CampoFiltroKey = keyof FiltrosAnunciosQuery;

// Campos del formulario: SET_CAMPO_FORM solo puede pisar una de estas celdas
export type CampoFormularioKey = keyof AnunciosTipado["formulario"];

/* ==========================================================================
   ACCIONES
   ========================================================================== */

export type AnunciosAction =

    /* ---------- 1. LISTADO ---------- */
    | { type: "SET_LISTADO"; payload: FilaAnuncio[] }
    | { type: "SET_CARGA"; payload: { bloque: BloqueCarga; valor: boolean } }
    | { type: "SET_ERROR"; payload: { bloque: BloqueCarga; valor: string | null } }
    | { type: "SET_PAGINACION"; payload: Partial<Paginacion> }
    // Refresca el listado DESDE la página 1
    | { type: "ACTUALIZAR" }
    | { type: "SET_CAMPO_FILTRO"; payload: { campo: CampoFiltroKey; valor: string | number | undefined } }
    | { type: "RESET_FILTROS" }

    /* ---------- 2. OPCIONES ---------- */
    | { type: "SET_EMPRESAS"; payload: FilaEmpresa[] }

    /* ---------- 3. FORMULARIO ---------- */
    // Abre el modal en ALTA: form de fábrica
    | { type: "ABRIR_MODAL" }
    // Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada
    | { type: "CARGAR_ANUNCIO_EDICION"; payload: FilaAnuncio }
    // Cierra el modal y limpia form, aviso, carga, media, método e id
    | { type: "CERRAR_MODAL" }
    // Escribe lo que se tipea / se elige en UNA celda del form
    | { type: "SET_CAMPO_FORM"; payload: { campo: CampoFormularioKey; valor: string } }
    // La media es un File: no entra en el patrón {campo, valor}
    | { type: "SET_MEDIA"; payload: File | null }

    /* ---------- 4. CONFIRMACIÓN DE BAJA ---------- */
    | { type: "ABRIR_ELIMINAR"; payload: FilaAnuncio }
    | { type: "CERRAR_ELIMINAR" };

/* ==========================================================================
   REDUCER
   ========================================================================== */

/**
 * Reducer de la pantalla de Anuncios: listado paginado con sus 5 filtros,
 * empresas del selector, formulario de alta / modificación y la confirmación
 * de baja.
 *
 * @param state - Estado vigente (`initialAnuncios()` al arrancar).
 * @param action - Acción a aplicar; siempre devuelve un estado nuevo.
 * @returns Estado nuevo con el cambio aplicado.
 */
export const AnunciosReducers = (
    state: AnunciosTipado,
    action: AnunciosAction
): AnunciosTipado => {

    switch (action.type) {

        /* ==================================================================
           1. LISTADO
           ================================================================== */

        // Al llegar filas nuevas se limpia SU aviso: `useEffectServicio` nunca
        // despacha `accionError(null)`, sin esto el error anterior quedaría
        // pegado en la pantalla.
        case "SET_LISTADO":
            return {
                ...state,
                listado: action.payload,
                error: { ...state.error, listado: null },
            };

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

        // Recibe la paginación de ApiResponse o un parcial: solo lo que viene
        // en el payload pisa el valor actual.
        case "SET_PAGINACION":
            return {
                ...state,
                paginacion: {
                    ...state.paginacion,
                    ...action.payload,
                },
            };

        // Refresco DESDE LA PÁGINA 1: sube el contador y resetea la página en
        // sus dos hogares — la de los filtros (el effect pide ?pagina=1) y la
        // del paginador (spec 005).
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
            };

        // Pisa UN campo del filtro. El `as` es necesario porque los filtros
        // mezclan tipos (`pagina`/`limit` son number, el resto son string) y
        // TypeScript no puede narrowing sobre una clave calculada: sin él, el
        // valor sería `never`.
        case "SET_CAMPO_FILTRO":
            return {
                ...state,
                filtros: {
                    ...state.filtros,
                    [action.payload.campo]: action.payload.valor,
                } as FiltrosAnunciosQuery,
            };

        // Vuelve a la configuración de fábrica. Resetear solo `filtros.pagina`
        // dejaría el paginador apuntando a otra página: la página vive en los
        // dos lados, así que se resetean juntas.
        case "RESET_FILTROS":
            return {
                ...state,
                filtros: initialAnuncios().filtros,
                paginacion: initialAnuncios().paginacion,
            };

        /* ==================================================================
           2. OPCIONES
           ================================================================== */

        // Empresas del selector. Mismo criterio que SET_LISTADO: un valor
        // nuevo borra SU aviso.
        case "SET_EMPRESAS":
            return {
                ...state,
                empresas: action.payload,
                error: { ...state.error, opciones: null },
            };

        /* ==================================================================
           3. FORMULARIO
           ================================================================== */

        // Abre el modal en ALTA: form de fábrica, sin el aviso de una
        // intentona anterior y con el método puesto en POST
        case "ABRIR_MODAL":
            return {
                ...state,
                metodo: "POST",
                id_anuncio: null,
                anuncioEnEdicion: null,
                modal: {
                    ...state.modal,
                    formulario: true,
                },
                error: {
                    ...state.error,
                    formulario: null,
                },
                formulario: initialAnuncios().formulario,
                media: null,
            };

        // Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada:
        // metodo "PUT" (para que el botón llame a putAnuncio), id que viaja en
        // el body y las 4 celdas precargadas. La media **no** se precarga
        // (queda en null = se conserva la actual): un `File` no se puede
        // recuperar de una URL.
        case "CARGAR_ANUNCIO_EDICION": {
            const fila = action.payload;
            return {
                ...state,
                metodo: "PUT",
                id_anuncio: fila.id_anuncio,
                anuncioEnEdicion: fila,
                modal: {
                    ...state.modal,
                    formulario: true,
                },
                error: {
                    ...state.error,
                    formulario: null,
                },
                // Si quedó cargando de una intentona anterior, se apaga
                carga: {
                    ...state.carga,
                    formulario: false,
                },
                formulario: {
                    id_empresa: { name: "id_empresa", value: String(fila.id_empresa) },
                    titulo: { name: "titulo", value: fila.titulo },
                    descripcion: { name: "descripcion", value: fila.descripcion },
                    tipo_contacto: { name: "tipo_contacto", value: fila.tipo_contacto },
                },
                media: null,
            };
        }

        // Cierra y limpia TODO lo del form: celdas, aviso, carga, media, el
        // método de trabajo y el id del anuncio que se estaba editando.
        case "CERRAR_MODAL":
            return {
                ...state,
                metodo: "POST",
                id_anuncio: null,
                anuncioEnEdicion: null,
                modal: {
                    ...state.modal,
                    formulario: false,
                },
                error: {
                    ...state.error,
                    formulario: null,
                },
                carga: {
                    ...state.carga,
                    formulario: false,
                },
                formulario: initialAnuncios().formulario,
                media: null,
            };

        // Pisa el `value` de UNA celda del form (input, select o textarea)
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

        // El `File` de la media. `null` lo deselecciona.
        case "SET_MEDIA":
            return {
                ...state,
                media: action.payload,
            };

        /* ==================================================================
           4. CONFIRMACIÓN DE BAJA
           ================================================================== */

        // La baja borra el archivo de R2 de forma definitiva: se pide
        // confirmación antes de mandarla.
        case "ABRIR_ELIMINAR":
            return {
                ...state,
                anuncioAEliminar: action.payload,
                modal: {
                    ...state.modal,
                    eliminar: true,
                },
                error: {
                    ...state.error,
                    eliminar: null,
                },
                carga: {
                    ...state.carga,
                    eliminar: false,
                },
            };

        case "CERRAR_ELIMINAR":
            return {
                ...state,
                anuncioAEliminar: null,
                modal: {
                    ...state.modal,
                    eliminar: false,
                },
                error: {
                    ...state.error,
                    eliminar: null,
                },
                carga: {
                    ...state.carga,
                    eliminar: false,
                },
            };

        default:
            return state;
    }
};