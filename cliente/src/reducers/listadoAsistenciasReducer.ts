import { calcularDiasAtras, fechaHoy } from "../utils/fecha";

import { type PaginacionProps } from "../tipadosTs/genericos";
import type {
    FiltroListadoAsistencias,
    ListadoAsistenciasAction,
    ListadoAsistenciasState
} from "../tipadosTs/asistenciaListado.typado";

/**
 * Filtros con los que arranca (y se resetea) la pantalla.
 *
 * El rango por defecto son los **últimos 30 días** contados desde hoy; el
 * resto de los filtros queda vacío (sin filtrar) y la página es la 1.
 *
 * @param {PaginacionProps} paginacion - Página y límite iniciales.
 * @returns {FiltroListadoAsistencias} Filtros listos para el estado.
 */
export const filtrosIniciales = ( paginacion : PaginacionProps ) : FiltroListadoAsistencias => ({
    dia_semana    : "",
    hora          : "",
    dni_profesor  : "",
    id_nivel      : "",
    id_tipo_clase : "",
    desde         : calcularDiasAtras( fechaHoy(), 30 ),
    hasta         : fechaHoy(),
    pagina        : paginacion.pagina ?? 1,
    limit         : paginacion.limite ?? 15
});

/**
 * Estado inicial del listado de asistencias.
 *
 * @param {Object} config - Configuración de la pantalla.
 * @param {PaginacionProps} config.paginacion - Página y límite iniciales
 *   (la página los define en `hookNegocios/listadoAsistencias.ts`).
 * @returns {ListadoAsistenciasState} Estado inicial.
 */
export const inicialState = ( config : { paginacion : PaginacionProps } ) : ListadoAsistenciasState => ({
    filtroData : filtrosIniciales( config.paginacion ),

    listado : [],

    barraPaginacion : {
        contadorPagina : 0,
        pagina         : config.paginacion.pagina,
        limite         : config.paginacion.limite
    },

    carga : false,

    errorGenerico : null,

    actualizarListado : 0,

    catalogos : {
        profesores : [],
        niveles    : [],
        tipos      : [],
        carga      : false
    }
});

/**
 * Reducer del listado de asistencias.
 *
 * Dos reglas viven acá y no en los handlers, para que valgan por cualquier
 * camino que toque los filtros:
 *
 * 1. **Auto-ajuste del rango (D16)**: si `desde` queda después de `hasta`, el
 *    otro extremo se mueve al valor recién elegido. Así nunca sale una
 *    petición con el rango invertido (el backend la rechazaría con 400).
 * 2. **Volver a la página 1 (CA-20)**: cualquier cambio de filtro regresa a la
 *    primera página. El único que puede mover `pagina` es el paginador, que es
 *    justamente el que manda `pagina` en el payload.
 *
 * @param {ListadoAsistenciasState} state - Estado actual.
 * @param {ListadoAsistenciasAction} action - Acción despachada.
 * @returns {ListadoAsistenciasState} Estado nuevo.
 */
export const listadoAsistenciasReducer = (
    state : ListadoAsistenciasState,
    action : ListadoAsistenciasAction
) : ListadoAsistenciasState => {
    switch ( action.type ){

        case "SET_FILTRO_DATA" : {
            const siguiente : FiltroListadoAsistencias = { ...state.filtroData, ...action.payload };

            if ( siguiente.desde && siguiente.hasta && siguiente.desde > siguiente.hasta ) {
                if ( "desde" in action.payload ) siguiente.hasta = siguiente.desde;
                else                             siguiente.desde = siguiente.hasta;
            };

            if ( !( "pagina" in action.payload ) ) siguiente.pagina = 1;

            return { ...state, filtroData : siguiente };
        };

        case "SET_LISTADO" :
            return { ...state, listado : action.payload };

        case "SET_BARRA_PAGINACION" :
            return { ...state, barraPaginacion : action.payload };

        case "SET_CARGA" :
            return { ...state, carga : action.payload };

        case "SET_ERROR_GENERICO" :
            return { ...state, errorGenerico : action.payload };

        case "SET_ACTUALIZAR_LISTADO" :
            return { ...state, actualizarListado : state.actualizarListado + 1 };

        case "SET_CATALOGOS" :
            return {
                ...state,
                catalogos : {
                    ...state.catalogos,
                    profesores : action.payload.profesores,
                    niveles    : action.payload.niveles,
                    tipos      : action.payload.tipos
                }
            };

        case "SET_CARGA_CATALOGOS" :
            return {
                ...state,
                catalogos : {
                    ...state.catalogos,
                    carga : action.payload
                }
            };

        default :
            return state;
    };
};
