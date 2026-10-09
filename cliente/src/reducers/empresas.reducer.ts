/* ==========================================================================
   ESTRUCTURA DEL ARCHIVO
   Todo está agrupado por especificidad, con el mismo orden en el tipado, el
   estado inicial, las acciones y el reducer:

   1. LISTADO            -> empresas paginadas (GET /api/empresa_lista)
   2. FORMULARIO         -> alta (POST /api/empresa_alta), modificación
                            (PUT /api/empresa_mod) y baja lógica
                            (DELETE /api/empresa_baja)
   3. ANUNCIOS DE LA EMPRESA -> los avisos de la empresa clickeada
                            (GET /api/anuncio_lista_empresa)

   El logo es un `File`, no un string: por eso tiene su propia acción
   (`SET_LOGO`) en vez de entrar en el patrón genérico `{campo, valor}`.

   `carga` y `error` se indexan con `BloqueCarga` (los 3 bloques de arriba).
   ========================================================================== */

/* ==========================================================================
   TIPOS AUXILIARES
   ========================================================================== */

import type {
    FilaEmpresa,
    FiltrosEmpresasQuery,
} from "../servicio/empresas.fetch";
// Fila de anuncio: la usa el bloque 3 (los avisos de la empresa clickeada)
import type { FilaAnuncio } from "../servicio/anuncios.fetch";
// Celdas del formulario: mismo tipo que el de suscripciones y cuentas
// (decisión de proyecto: los tipos del form viven en `reducers/suspcripciones.ts`)
import type { CeldasInput } from "./suspcripciones";

/** Identifica el bloque que toca la acción. Las 4 acciones genéricas
 *  (SET_CARGA / SET_ERROR) lo necesitan; las de listado no, porque hay uno. */
export type BloqueCarga = "listado" | "formulario" | "anuncios" | "eliminar";

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

export interface EmpresasTipado {

    /* ---------- 1. LISTADO ---------- */
    filtros: FiltrosEmpresasQuery;
    listado: FilaEmpresa[];
    paginacion: Paginacion;
    // Contador de refresco: cuando sube, el effect vuelve a pedir las filas
    // desde la página 1 (mismo criterio que la spec 005).
    actualizar: number;

    /* ---------- CLAVES POR BLOQUE ---------- */
    // ¿Cargando? Una clave por bloque: SET_CARGA { bloque, valor }
    carga: {
        listado: boolean;
        formulario: boolean;
        anuncios: boolean;
        eliminar: boolean;
    },
    // Aviso de cada bloque (null = sin error)
    error: {
        listado: string | null;
        formulario: string | null;
        anuncios: string | null;
        eliminar: string | null;
    },
    // Los 3 modales de la pantalla, en un solo objeto: el del formulario (alta
    // y modificación), el panel con los anuncios de la empresa clickeada y la
    // confirmación de baja.
    modal: {
        formulario: boolean;
        anuncios: boolean;
        eliminar: boolean;
    },

    /* ---------- 2. FORMULARIO ---------- */
    // ¿En qué modo está abierto el form? POST = alta, PUT = modificación.
    // Lo fija ABRIR_MODAL / CARGAR_EMPRESA_EDICION y lo limpia CERRAR_MODAL.
    metodo: "POST" | "PUT" | null,
    // Empresa a modificar: id que sale de la fila del listado y viaja en el PUT.
    id_empresa: number | null,
    // Fila completa de la empresa que se está editando. Solo la usa el form
    // para mostrar el logo actual en la vista previa (un `File` no se puede
    // recuperar de una URL, así que sin esto no se vería nada al abrir).
    empresaEnEdicion: FilaEmpresa | null,
    // Empresa cuya baja se está por confirmar. La baja es LÓGICA, pero igual
    // pide confirmación: esconde la empresa de todos los listados y del
    // selector de anuncios, así que es un cambio que se nota.
    empresaAEliminar: FilaEmpresa | null,
    // Celdas del form. Las 3 redes son opcionales en el schema del server.
    formulario: {
        razon_social: CeldasInput;
        domicilio: CeldasInput;
        whatsapp: CeldasInput;
        instagram: CeldasInput;
        facebook: CeldasInput;
    },
    // Logo nuevo elegido en el form. `null` = no se eligió ninguno, así que el
    // server conserva el que ya estaba. Nunca se precarga: el logo actual se
    // ve en la lista, no en el input de archivo.
    logo: File | null;

    /* ---------- 3. ANUNCIOS DE LA EMPRESA ---------- */
    // Empresa clickeada en la lista (la que explica de quién son los avisos).
    // `null` = todavía no se clickeó ninguna.
    empresaSeleccionada: FilaEmpresa | null,
    // Avisos de esa empresa. La respuesta NO trae paginación (el server no
    // pagina este listado), así que no hay paginador que alimentar.
    listadoAnuncios: FilaAnuncio[];
}

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */

export const initialEmpresas = (): EmpresasTipado => ({

    /* ---------- 1. LISTADO ---------- */
    filtros: {
        pagina: 1,
        // 6 como el de cuentas (spec 006): son filas con logo y datos de contacto
        limit: 6,
        // sin `razon_social` ni `estado` = todas las activas
    },
    listado: [],
    paginacion: {
        pagina: 1,
        limite: 6,
        contadorPagina: 1,
    },
    actualizar: 0,

    carga: {
        listado: false,
        formulario: false,
        anuncios: false,
        eliminar: false,
    },
    error: {
        listado: null,
        formulario: null,
        anuncios: null,
        eliminar: null,
    },

    /* ---------- 2. FORMULARIO ---------- */
    metodo: "POST",
    id_empresa: null,
    empresaEnEdicion: null,
    empresaAEliminar: null,
    modal: {
        formulario: false,
        anuncios: false,
        eliminar: false,
    },
    formulario: {
        razon_social: { name: "razon_social", value: "" },
        domicilio: { name: "domicilio", value: "" },
        whatsapp: { name: "whatsapp", value: "" },
        instagram: { name: "instagram", value: "" },
        facebook: { name: "facebook", value: "" },
    },
    logo: null,

    /* ---------- 3. ANUNCIOS DE LA EMPRESA ---------- */
    empresaSeleccionada: null,
    listadoAnuncios: [],
});

/* ==========================================================================
   TIPOS AUXILIARES DE LAS ACCIONES
   ========================================================================== */

// Campos del filtro: SET_CAMPO_FILTRO solo puede pisar uno de estos
// (pagina / limit viajan en el request; los otros 2 son opcionales)
export type CampoFiltroKey = keyof FiltrosEmpresasQuery;

// Campos del formulario: SET_CAMPO_FORM solo puede pisar una de estas celdas
export type CampoFormularioKey = keyof EmpresasTipado["formulario"];

/* ==========================================================================
   ACCIONES
   ========================================================================== */

export type EmpresasAction =

    /* ---------- 1. LISTADO ---------- */
    | { type: "SET_LISTADO"; payload: FilaEmpresa[] }
    | { type: "SET_CARGA"; payload: { bloque: BloqueCarga; valor: boolean } }
    | { type: "SET_ERROR"; payload: { bloque: BloqueCarga; valor: string | null } }
    | { type: "SET_PAGINACION"; payload: Partial<Paginacion> }
    // Refresca el listado DESDE la página 1
    | { type: "ACTUALIZAR" }
    | { type: "SET_CAMPO_FILTRO"; payload: { campo: CampoFiltroKey; valor: string | number | undefined } }
    | { type: "RESET_FILTROS" }

    /* ---------- 2. FORMULARIO ---------- */
    // Abre el modal en ALTA: form de fábrica
    | { type: "ABRIR_MODAL" }
    // Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada
    | { type: "CARGAR_EMPRESA_EDICION"; payload: FilaEmpresa }
    // Cierra el modal y limpia form, aviso, carga, logo, método e id
    | { type: "CERRAR_MODAL" }
    // Escribe lo que se tipea en UNA celda del form
    | { type: "SET_CAMPO_FORM"; payload: { campo: CampoFormularioKey; valor: string } }
    // El `File` del logo
    | { type: "SET_LOGO"; payload: File | null }
    // Click en "Eliminar": guarda la fila y abre la confirmación
    | { type: "ABRIR_ELIMINAR"; payload: FilaEmpresa }
    | { type: "CERRAR_ELIMINAR" }

    /* ---------- 3. ANUNCIOS DE LA EMPRESA ---------- */
    // Click en una fila: guarda la empresa y abre el panel de sus avisos
    | { type: "ABRIR_PANEL_ANUNCIOS"; payload: FilaEmpresa }
    | { type: "CERRAR_PANEL_ANUNCIOS" }
    | { type: "SET_LISTADO_ANUNCIOS"; payload: FilaAnuncio[] };

/* ==========================================================================
   REDUCER
   ========================================================================== */

/**
 * Reducer de la pantalla de Empresas: listado paginado con filtros, formulario
 * de alta / modificación / baja, y el panel con los anuncios de la empresa
 * clickeada.
 *
 * @param state - Estado vigente (`initialEmpresas()` al arrancar).
 * @param action - Acción a aplicar; siempre devuelve un estado nuevo.
 * @returns Estado nuevo con el cambio aplicado.
 */
export const EmpresasReducers = (
    state: EmpresasTipado,
    action: EmpresasAction
): EmpresasTipado => {

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
        // mezclan tipos (`pagina`/`limit` son number, `razon_social`/`estado`
        // son string) y TypeScript no puede narrowing sobre una clave
        // calculada: sin él, el valor sería `never`.
        case "SET_CAMPO_FILTRO":
            return {
                ...state,
                filtros: {
                    ...state.filtros,
                    [action.payload.campo]: action.payload.valor,
                } as FiltrosEmpresasQuery,
            };

        // Vuelve a la configuración de fábrica. Resetear solo `filtros.pagina`
        // dejaría el paginador apuntando a otra página: la página vive en los
        // dos lados, así que se resetean juntas.
        case "RESET_FILTROS":
            return {
                ...state,
                filtros: initialEmpresas().filtros,
                paginacion: initialEmpresas().paginacion,
            };

        /* ==================================================================
           2. FORMULARIO
           ================================================================== */

        // Abre el modal en ALTA: form de fábrica, sin el aviso de una
        // intentona anterior y con el método puesto en POST
        case "ABRIR_MODAL":
            return {
                ...state,
                metodo: "POST",
                id_empresa: null,
                empresaEnEdicion: null,
                modal: {
                    ...state.modal,
                    formulario: true,
                },
                error: {
                    ...state.error,
                    formulario: null,
                },
                formulario: initialEmpresas().formulario,
                logo: null,
            };

        // Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada:
        // metodo "PUT" (para que el botón llame a putEmpresa), id que viaja en
        // el body y las 5 celdas precargadas. El logo **no** se precarga (null
        // = se conserva el actual) porque un `File` no se puede recuperar de
        // una URL.
        case "CARGAR_EMPRESA_EDICION": {
            const fila = action.payload;
            return {
                ...state,
                metodo: "PUT",
                id_empresa: fila.id_empresa,
                empresaEnEdicion: fila,
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
                    razon_social: { name: "razon_social", value: fila.razon_social },
                    domicilio: { name: "domicilio", value: fila.domicilio },
                    // `null` en la fila = sin red cargada = celda vacía
                    whatsapp: { name: "whatsapp", value: fila.whatsapp ?? "" },
                    instagram: { name: "instagram", value: fila.instagram ?? "" },
                    facebook: { name: "facebook", value: fila.facebook ?? "" },
                },
                logo: null,
            };
        }

        // Cierra y limpia TODO lo del form: celdas, aviso, carga, logo, el
        // método de trabajo y el id de la empresa que se estaba editando.
        case "CERRAR_MODAL":
            return {
                ...state,
                metodo: "POST",
                id_empresa: null,
                empresaEnEdicion: null,
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
                formulario: initialEmpresas().formulario,
                logo: null,
            };

        // Pisa el `value` de UNA celda del form
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

        // El `File` del logo. `null` lo deselecciona.
        case "SET_LOGO":
            return {
                ...state,
                logo: action.payload,
            };

        /* ==================================================================
           2.b CONFIRMACIÓN DE BAJA
           ================================================================== */

        // La baja es lógica (la fila queda con estado "inactivos"), pero se
        // pide confirmación: la empresa desaparece del listado y del selector
        // de anuncios.
        case "ABRIR_ELIMINAR":
            return {
                ...state,
                empresaAEliminar: action.payload,
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
                empresaAEliminar: null,
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

        /* ==================================================================
           3. ANUNCIOS DE LA EMPRESA
           ================================================================== */

        // Click en la fila: se guarda la empresa y se abre el panel. El aviso
        // anterior se limpia para que no se vea el de otra empresa.
        case "ABRIR_PANEL_ANUNCIOS":
            return {
                ...state,
                empresaSeleccionada: action.payload,
                modal: {
                    ...state.modal,
                    anuncios: true,
                },
                error: {
                    ...state.error,
                    anuncios: null,
                },
            };

        case "CERRAR_PANEL_ANUNCIOS":
            return {
                ...state,
                empresaSeleccionada: null,
                modal: {
                    ...state.modal,
                    anuncios: false,
                },
                carga: {
                    ...state.carga,
                    anuncios: false,
                },
                listadoAnuncios: [],
            };

        // Mismo criterio que SET_LISTADO: un valor nuevo borra SU aviso.
        case "SET_LISTADO_ANUNCIOS":
            return {
                ...state,
                listadoAnuncios: action.payload,
                error: { ...state.error, anuncios: null },
            };

        default:
            return state;
    }
};