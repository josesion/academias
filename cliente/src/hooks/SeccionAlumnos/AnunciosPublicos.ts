import { useCallback, useReducer } from "react";

import {
    AnunciosPublicosReducers,
    initialAnunciosPublicos,
    type AnunciosPublicosAction,
    type Paginacion,
} from "../../reducers/anunciosPublicos.reducer";
import { useEffectServicio } from "../../utils/useEfectServicio";

import type {
    FilaAnuncioPublico,
    FiltrosAnunciosPublicosQuery,
} from "../../servicio/anuncios.publico.fetch";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

/** Cuántos anuncios se piden por tanda en el carrusel. */
const LIMITE_PAGINA = 10;

interface PropsAnunciosPublicos {
    servicios: {
        listaAnunciosPublicos: ServicioCrud,
    },
};

/**
 * Lógica del carrusel público de anuncios (spec 019): el que se ve en la
 * pantalla principal del alumno.
 *
 * Tiene UNA diferencia con el listado del administrador: **acumula** en vez de
 * reemplazar. Cada página que se pide se AGREGA al final (`AGREGAR_ANUNCIOS`),
 * así el carrusel no se reinicia cuando el usuario scrollea hasta el fondo.
 *
 * La primera carga reemplaza (`SET_LISTADO`) y se dispara cuando cambia
 * `filtros` o `actualizar`; las siguientes se agregan, y solo pasan cuando
 * `state.pagina` crece vía `cargarMas`.
 *
 * @param config - Servicios inyectados desde `hookNegocios/abmAnunciosPublicos.ts`.
 * @returns `state` del reducer + `cargarMas` y `refrescar`.
 */
export const useLogicaAnunciosPublicos = (config: PropsAnunciosPublicos) => {

    const [state, dispatch] = useReducer(AnunciosPublicosReducers, initialAnunciosPublicos());

    // ¿Es la primera carga? El reducer solo la conoce por dentro, así que se
    // compara con el estado actual: si la página que se pidió es la 1 y todavía
    // no hay nada cargado, es la primera.
    // Se manda como valor del effect, no como estado.
    const esPrimeraCarga = state.filtros.pagina === 1;

    /* ======================================================================
       LISTADO (GET /api/anuncio_lista_publico)
       ====================================================================== */

    useEffectServicio<FiltrosAnunciosPublicosQuery, FilaAnuncioPublico[], AnunciosPublicosAction>({
        dispatch,
        servicios: config.servicios.listaAnunciosPublicos,
        valores: state.filtros,
        // Primer reemplazo, siguientes acumulan: sin esto se pisan las tarjetas
        // que ya estaban en pantalla y el carrusel se reinicia al scrollear.
        accionResultado: (filas) => ({
            type: esPrimeraCarga ? "SET_LISTADO" : "AGREGAR_ANUNCIOS",
            payload: filas ?? []
        }),
        accionCarga:  (carga) => ({ type: "SET_CARGA", payload: { bloque: "listado", valor: carga } }),
        accionError:  (msg)   => ({ type: "SET_ERROR", payload: { bloque: "listado", valor: msg } }),
        // El `apiFetch` ya normaliza el 204 (`SIN_ANUNCIOS`) a
        // `{ error: false, data: null }`, así que "sin anuncios" llega acá como
        // lista vacía y no como aviso rojo.
        //
        // El `as` es porque `useEfectServicio` declara su propia `Paginacion`
        // de 3 campos; la del servidor trae además `totalRegistros`, que es lo
        // que usa el contador "X de Y". En tiempo de ejecución el campo está.
        accionPaginacion: (p) => ({
            type: "SET_PAGINACION",
            payload: p as unknown as Partial<Paginacion>,
        }),
        useAbort: true,
        dependencias: [state.filtros, state.actualizar],
    });

    /**
     * Pide la página siguiente y la agrega al carrusel.
     *
     * No llama al fetch de forma directa: cambia `filtros.pagina`, que está en
     * las dependencias del effect de arriba, y el effect se encarga. Así hay un
     * solo camino para pedir datos y el `carga.listado` sigue cubriendo las dos.
     */
    // `useCallback` para que la referencia no cambie en cada render:
    // el `IntersectionObserver` de la página la pone en las
    // dependencias de su effect, y sin esto reconectaría el observer
    // cada vez que la página se renderiza.
    const cargarMas = useCallback(() => {
        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "pagina", valor: state.filtros.pagina + 1 } });
    }, [state.filtros.pagina]);

    /**
     * Refresca el carrusel desde la página 1 (por ejemplo después de que el
     * administrador creó un anuncio en otra pestaña).
     */
    const refrescar = useCallback(() => {
        dispatch({ type: "ACTUALIZAR" });
    }, []);

    return {
        state,
        cargarMas,
        refrescar,
        /** Tope de filas por tanda, para que la página arme el contador. */
        limitePagina: LIMITE_PAGINA,
    };
};