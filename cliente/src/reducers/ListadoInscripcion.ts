import { calcularSeisMesesAtras, fechaHoy } from "../utils/fecha";

import type { FiltroBusqueda, InscripcionListadoResult  } from "../tipadosTs/inscripciones";
import { type PaginacionProps } from "../tipadosTs/genericos";


interface ListadoInscripcionState {
    errorGenerico : string | null,
    filtroData : FiltroBusqueda,
    dataAnularInscripcion : {},
    actualizarListado : number,
    carga : boolean,
    listadoInscripcion : InscripcionListadoResult[],
    barraPaginacion : PaginacionProps,
};

export const inicialState = ( config : {

    inicialFiltrosBusqueda :{
        nombre_alumno : string ,
        dni_alumno : string,
    },
    paginacion : PaginacionProps

}) : ListadoInscripcionState => ({
    errorGenerico : null,

    actualizarListado : 0,

    filtroData   :{
        ...config.inicialFiltrosBusqueda,
        fecha_desde : calcularSeisMesesAtras(fechaHoy()),
        fecha_hasta : fechaHoy(),
        estado : "activos",
        pagina : config.paginacion.pagina as number,
        limit : config.paginacion.limite as number,
    },

    dataAnularInscripcion : {},// se debe modifcar para q funcione
    carga : false,

    listadoInscripcion : [],

    barraPaginacion : {
        contadorPagina : 0,
        pagina : config.paginacion.pagina,
        limite : config.paginacion.limite
    }

});


export type ListadoInscripcionAction = 

        | { type : 'SET_ERROR_GENERICO'; payload: string  | null}
        | { type : 'SET_CARGA'; payload: boolean}      
        | { type : "SET_FILTRO_DATA" ; payload : FiltroBusqueda }
        | { type : "SET_ACTUALIZAR_LISTADO"}
        | { type : "SET_LISTADO_INSCRIPCION" ; payload : InscripcionListadoResult[]}
        | { type : "SET_BARRA_PAGINACION" ; payload : PaginacionProps}   


export const ListadoInscripcionReducer = ( state : ReturnType< typeof inicialState>, action : ListadoInscripcionAction ) : ReturnType< typeof inicialState> => {
    switch ( action.type ){
        case "SET_ERROR_GENERICO" :
            return { ...state, errorGenerico : action.payload}

        case "SET_CARGA" :
            return { ...state , carga : action.payload}    

        case "SET_FILTRO_DATA" : 
            return { ...state, filtroData : action.payload}

        case "SET_ACTUALIZAR_LISTADO" :
            return { ...state , actualizarListado : state.actualizarListado + 1}   
            
        case "SET_LISTADO_INSCRIPCION" : 
            return { ...state, listadoInscripcion : action.payload}    

       case "SET_BARRA_PAGINACION" : 
           return { ...state, barraPaginacion : action.payload}     
    };
};