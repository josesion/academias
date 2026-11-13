import { useEffect, useReducer, type ChangeEvent } from "react";

import {
    filtrosIniciales,
    inicialState,
    listadoAsistenciasReducer
} from "../../reducers/listadoAsistenciasReducer";

import { peticiones } from "../../utils/peticiones";

import type { ApiResponse } from "../../utils/apiFetch";
import type { PaginacionProps } from "../../tipadosTs/genericos";
import type { ListadoNivel } from "../../tipadosTs/nivel";
import type { ListadoProfeSinPag } from "../../tipadosTs/profesores";
import type { listadoTipoSinPaginacion as FiltroTipoSinPag } from "../../tipadosTs/tipo";
import type {
    AsistenciaListadoItem,
    FiltroListadoAsistencias,
    NivelOpcion,
    OpcionListadoAsistencias,
    PaginacionListadoAsistencias,
    ProfesorOpcion,
    TipoOpcion
} from "../../tipadosTs/asistenciaListado.typado";

/**
 * Servicios que cablea `hookNegocios/listadoAsistencias.ts`.
 *
 * Los tres catálogos devuelven `ApiResponse<unknown>` a propósito: el tipo que
 * declara cada `fetch` **no coincide con el runtime** (por ejemplo
 * `listadoProfesoresSinPag` devuelve `Dni`/`Nombre`/`Apellido` y no
 * `dni`/`nombre`/`apellido`), así que el casteo se hace en un solo lugar y
 * queda documentado.
 */
interface ListadoAsistenciasConfig {
    servicios : {
        /** Listado paginado (`GET /api/lista_asistencias`). */
        listado : ( filtros : FiltroListadoAsistencias, signal? : AbortSignal ) => Promise<ApiResponse<AsistenciaListadoItem[]>>;
        /** Profesores activos de la escuela. */
        listadoProfesores : ( data : ListadoProfeSinPag, signal? : AbortSignal ) => Promise<ApiResponse<unknown>>;
        /** Niveles activos de la escuela. */
        listadoNivel : ( data : ListadoNivel, signal? : AbortSignal ) => Promise<ApiResponse<unknown>>;
        /** Tipos de clase activos de la escuela. */
        listadoTipo : ( data : FiltroTipoSinPag, signal? : AbortSignal ) => Promise<ApiResponse<unknown>>;
    };
    /** Página y límite iniciales (los fija `hookNegocios`). */
    paginacion : PaginacionProps;
    /** Opciones del `<select>` de día (valor sin tildes, etiqueta con tildes). */
    opcionesDia : OpcionListadoAsistencias[];
    /** Opciones del `<select>` de hora (`HORARIOS` de `hookNegocios/horarios`). */
    opcionesHora : OpcionListadoAsistencias[];
};

/**
 * Campos de `FiltroListadoAsistencias` que el formulario manda como texto.
 * `pagina` y `limit` quedan afuera porque son numéricos y no salen de un
 * `<input>`/`<select>`.
 */
const CAMPOS_TEXTO_FILTRO = [
    "dia_semana",
    "hora",
    "dni_profesor",
    "id_nivel",
    "id_tipo_clase",
    "desde",
    "hasta"
] as const;

type CampoTextoFiltro = typeof CAMPOS_TEXTO_FILTRO[number];

/**
 * Verifica que el `name` del control sea uno de los filtros de texto.
 *
 * Es lo que permite un `handleChangeFiltro` genérico sin terminar con un
 * objeto indexado incompatible con `Partial<FiltroListadoAsistencias>`.
 *
 * @param {string} name - Atributo `name` del control que disparó el evento.
 * @returns {boolean} `true` si el campo es uno de los filtros de texto.
 */
const esCampoTextoFiltro = ( name : string ) : name is CampoTextoFiltro =>
    ( CAMPOS_TEXTO_FILTRO as readonly string[] ).includes( name );

/**
 * Lógica de la página "Listado de Asistencias" (spec 048).
 *
 * Se ocupa de:
 * - el `useReducer` con el estado de `listadoAsistenciasReducer`;
 * - la **única** petición del listado, con debounce de 5 s y `AbortController`;
 * - la carga de los tres catálogos (`Promise.allSettled`, **una sola vez**);
 * - los handlers del formulario y del paginador.
 *
 * No usa `useActualizarAlEnfocar`: refrescar al recuperar el foco multiplicaría
 * las peticiones y no fue pedido.
 *
 * @param {ListadoAsistenciasConfig} config - Servicios, paginación y opciones.
 * @returns Estado y handlers que consume la página.
 */
export const useListadoAsistenciasLogica = ( config : ListadoAsistenciasConfig ) => {

    // Se desestructuran las funciones para que las dependencias de los
    // `useEffect` sean referencias estables (los imports de los servicios no
    // cambian entre renders) y no el objeto `config`, que se recrea siempre.
    const {
        listado,
        listadoProfesores,
        listadoNivel,
        listadoTipo
    } = config.servicios;

    const [ state, dispatch ] = useReducer(
        listadoAsistenciasReducer,
        inicialState({ paginacion : config.paginacion })
    );

    ////////////////////////////////////////////////////////////////////////////////
    //
    //  HANDLERS DEL FORMULARIO
    //
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * Cambia un filtro de texto (día, hora, profesor, nivel, tipo o fechas).
     *
     * El `SET_FILTRO_DATA` del reducer se encarga de volver a la página 1 y de
     * auto-corregir un rango invertido; acá sólo se despacha el campo nuevo.
     *
     * @param {ChangeEvent<HTMLInputElement | HTMLSelectElement>} event - Evento del control.
     */
    const handleChangeFiltro = ( event : ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
        const { name, value } = event.target;

        // `name` llega como string: sólo se aceptan los campos conocidos.
        if ( !esCampoTextoFiltro( name ) ) return;

        // El casteo es seguro: `name` se validó arriba y `value` siempre es texto.
        dispatch({
            type : "SET_FILTRO_DATA",
            payload : { [ name ] : value } as Partial<FiltroListadoAsistencias>
        });
    };

    /**
     * Cambia la fecha "Desde".
     *
     * Va aparte de `handleChangeFiltro` porque los `input[type="date"]` de
     * `FiltroFechas` **no tienen `name`** (sólo `id`), así que el handler
     * genérico no puede saber qué campo cambió.
     *
     * @param {ChangeEvent<HTMLInputElement>} event - Evento del input "Desde".
     */
    const handleChangeDesde = ( event : ChangeEvent<HTMLInputElement> ) => {
        dispatch({ type : "SET_FILTRO_DATA", payload : { desde : event.target.value } });
    };

    /**
     * Cambia la fecha "Hasta" (mismo criterio que "Desde").
     *
     * @param {ChangeEvent<HTMLInputElement>} event - Evento del input "Hasta".
     */
    const handleChangeHasta = ( event : ChangeEvent<HTMLInputElement> ) => {
        dispatch({ type : "SET_FILTRO_DATA", payload : { hasta : event.target.value } });
    };

    /**
     * Cambia la página pedida sin tocar el resto de los filtros.
     *
     * @param {number} pagina - Página destino (1-based).
     */
    const handlePaginaCambiada = ( pagina : number ) => {
        dispatch({ type : "SET_FILTRO_DATA", payload : { pagina } });
    };

    /**
     * Vuelve a los filtros iniciales: últimos 30 días, sin filtros y página 1.
     */
    const handleLimpiarFiltros = () => {
        dispatch({ type : "SET_FILTRO_DATA", payload : filtrosIniciales( config.paginacion ) });
    };

    ////////////////////////////////////////////////////////////////////////////////
    //
    //  LISTADO DE ASISTENCIAS
    //
    ////////////////////////////////////////////////////////////////////////////////

    useEffect( () => {

        const { controlador, signal, timeoutId } = peticiones({
            tiempo : 5,
            setErrorGenerico : ( mensaje ) => dispatch({ type : "SET_ERROR_GENERICO", payload : mensaje }),
            setCarga         : ( estado ) => dispatch({ type : "SET_CARGA", payload : estado })
        });

        /**
         * Pide la página actual del listado y guarda filas y paginación.
         */
        const cargarListado = async () => {

            dispatch({ type : "SET_CARGA", payload : true });
            dispatch({ type : "SET_ERROR_GENERICO", payload : null });

            try {
                const respuesta = await listado( state.filtroData, signal );

                if ( respuesta.error ) {
                    // Petición abortada (timeout o desmontaje): no es un error de pantalla.
                    if ( respuesta.code === "REQUEST_ABORTED" ) return;

                    dispatch({ type : "SET_ERROR_GENERICO", payload : respuesta.message });
                    dispatch({ type : "SET_LISTADO", payload : [] });
                    dispatch({ type : "SET_BARRA_PAGINACION", payload : {
                        pagina         : state.filtroData.pagina,
                        limite         : state.filtroData.limit,
                        contadorPagina : 0
                    }});
                    return;
                };

                dispatch({
                    type : "SET_LISTADO",
                    payload : Array.isArray( respuesta.data ) ? respuesta.data : []
                });

                // El `ApiResponse` del `apiFetch` no declara `totalRegistros`.
                const paginacion = respuesta.paginacion as unknown as PaginacionListadoAsistencias | undefined;

                dispatch({
                    type : "SET_BARRA_PAGINACION",
                    payload : {
                        pagina         : paginacion?.pagina ?? state.filtroData.pagina,
                        limite         : paginacion?.limite ?? state.filtroData.limit,
                        contadorPagina : paginacion?.contadorPagina ?? 0
                    }
                });

            } catch {
                dispatch({
                    type : "SET_ERROR_GENERICO",
                    payload : "Ocurrió un error inesperado al cargar el listado de asistencias."
                });
                dispatch({ type : "SET_LISTADO", payload : [] });
            } finally {
                clearTimeout( timeoutId );
                dispatch({ type : "SET_CARGA", payload : false });
            };
        };

        cargarListado();

        return () => {
            clearTimeout( timeoutId );
            controlador.abort();
        };

    }, [ state.filtroData, state.actualizarListado, listado ]);

    ////////////////////////////////////////////////////////////////////////////////
    //
    //  CATÁLOGOS DE LOS SELECTORES (una sola vez)
    //
    ////////////////////////////////////////////////////////////////////////////////

    useEffect( () => {

        const controlador = new AbortController();
        const { signal } = controlador;
        let cancelado = false;

        /**
         * Pide los profesores activos de la escuela.
         *
         * @returns {Promise<ProfesorOpcion[]>} Filas con `Dni`/`Nombre`/`Apellido`
         *   (alias reales del SQL), o `[]` si la petición falló.
         */
        const cargarProfesores = async () : Promise<ProfesorOpcion[]> => {
            const respuesta = await listadoProfesores({ dni : "", estado : "activos" }, signal);
            if ( respuesta.error ) return [];
            if ( !Array.isArray( respuesta.data ) ) return [];
            return respuesta.data as ProfesorOpcion[];
        };

        /**
         * Pide los niveles activos de la escuela.
         *
         * @returns {Promise<NivelOpcion[]>} Filas `{ id, nivel }`, o `[]` si falló.
         */
        const cargarNiveles = async () : Promise<NivelOpcion[]> => {
            const respuesta = await listadoNivel({ nivel : "", estado : "activos" }, signal);
            if ( respuesta.error ) return [];
            if ( !Array.isArray( respuesta.data ) ) return [];
            return respuesta.data as NivelOpcion[];
        };

        /**
         * Pide los tipos de clase activos de la escuela.
         *
         * @returns {Promise<TipoOpcion[]>} Filas `{ id, tipo }`, o `[]` si falló.
         */
        const cargarTipos = async () : Promise<TipoOpcion[]> => {
            const respuesta = await listadoTipo({ tipo : "", estado : "activos" }, signal);
            if ( respuesta.error ) return [];
            if ( !Array.isArray( respuesta.data ) ) return [];
            return respuesta.data as TipoOpcion[];
        };

        /**
         * Carga los tres catálogos en paralelo.
         *
         * `allSettled` a propósito: si uno falla, los otros dos se muestran
         * igual y el selector fallido queda vacío (no rompe la pantalla).
         */
        const cargarCatalogos = async () => {

            dispatch({ type : "SET_CARGA_CATALOGOS", payload : true });

            const [ profesores, niveles, tipos ] = await Promise.allSettled([
                cargarProfesores(),
                cargarNiveles(),
                cargarTipos()
            ]);

            if ( cancelado ) return;

            dispatch({
                type : "SET_CATALOGOS",
                payload : {
                    profesores : profesores.status === "fulfilled" ? profesores.value : [],
                    niveles    : niveles.status    === "fulfilled" ? niveles.value    : [],
                    tipos      : tipos.status      === "fulfilled" ? tipos.value      : []
                }
            });

            dispatch({ type : "SET_CARGA_CATALOGOS", payload : false });
        };

        cargarCatalogos();

        return () => {
            cancelado = true;
            controlador.abort();
        };

    }, [ listadoProfesores, listadoNivel, listadoTipo ] );

    return {
        state,
        opcionesDia    : config.opcionesDia,
        opcionesHora   : config.opcionesHora,
        handleChangeFiltro,
        handleChangeDesde,
        handleChangeHasta,
        handlePaginaCambiada,
        handleLimpiarFiltros
    };
};
