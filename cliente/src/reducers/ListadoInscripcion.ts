import { calcularSeisMesesAtras, fechaHoy } from "../utils/fecha";
import  type * as TipadoAsistencia  from "../tipadosTs/asistencia.typado";
import type { FiltroBusqueda, InscripcionListadoResult  } from "../tipadosTs/inscripciones";
import { type PaginacionProps } from "../tipadosTs/genericos";


interface ListadoInscripcionState {
    errorGenerico : string | null,
    filtroData : FiltroBusqueda,
    //dataAnularInscripcion : {},
    actualizarListado : number,
    carga : boolean,
    listadoInscripcion : InscripcionListadoResult[],
    barraPaginacion : PaginacionProps,

        // anular inscripcion
        dataAnularInscripcion : TipadoAsistencia.dataAnular,
        errorAnulacion : string | null,
        listadoCuentas : TipadoAsistencia.ListadoCuentas[],
        dataInfoDetalle: TipadoAsistencia.DataDetalle,
        listoAnular : boolean,
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

    //dataAnularInscripcion : {},// se debe modifcar para q funcione
    carga : false,

    listadoInscripcion : [],

    barraPaginacion : {
        contadorPagina : 0,
        pagina : config.paginacion.pagina,
        limite : config.paginacion.limite
    },

    //anular inscripcio
    dataAnularInscripcion : {
        modalAnular : false,
        id_cuenta : null,
        idInscripcion : null,
        metodo_pago : "",
        monto_pagado : "",
        carga : false,
        texto : "",       
    },
    errorAnulacion : null,
    listadoCuentas : [],
    dataInfoDetalle :{
        nombre_completo: "",
        dni_alumno: 0,
        clases_totales: 0,
        clases_tomadas: 0,
        vigencia: "",
        monto_pagado: "",
        metodo_pago_descrip: "",    
    },
    listoAnular : false 

});


export type ListadoInscripcionAction = 

        | { type : 'SET_ERROR_GENERICO'; payload: string  | null}
        | { type : 'SET_CARGA'; payload: boolean}      
        | { type : "SET_FILTRO_DATA" ; payload : FiltroBusqueda }
        | { type : "SET_ACTUALIZAR_LISTADO"}
        | { type : "SET_LISTADO_INSCRIPCION" ; payload : InscripcionListadoResult[]}
        | { type : "SET_BARRA_PAGINACION" ; payload : PaginacionProps}   
 
        | { type : "SET_CACHEAR_METODO_PAGO" ; payload : { 
             dataAnularInscripcion : TipadoAsistencia.dataAnular,
             listoAnular : boolean
        }} 
        | { type : 'SET_ERROR_ANULAR'; payload: string  | null}
        | { type : 'SET_ANULAR_CARGAR'; payload: TipadoAsistencia.dataAnular}  
        
        | { type : 'SET_FORMATEAR_ANULACION'}
        | { type : 'SET_LISTADO_CUENTAS'; payload : TipadoAsistencia.ListadoCuentas[]}             


        | { type : 'SET_INFO_DETALLE'; payload : TipadoAsistencia.DataDetalle}    
        | { type : 'SET_INFO_ANULAR' ; payload : TipadoAsistencia.dataAnular}             

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
           
           

       case "SET_CACHEAR_METODO_PAGO" :
           return { 
                ...state,
                dataAnularInscripcion : action.payload.dataAnularInscripcion,
                listoAnular : action.payload.listoAnular
           }   
       case "SET_ERROR_ANULAR" :
           return { ...state, errorAnulacion : action.payload} 
           
       case "SET_ANULAR_CARGAR" :
          return {
                ...state, // 1. Mantenemos TODAS las propiedades del estado principal
                dataAnularInscripcion: {
                    ...state.dataAnularInscripcion, // 2. Mantenemos las propiedades anteriores del objeto interno
                    carga: action.payload.carga // 3. Actualizamos solo el valor booleano
          }} 
          
       case "SET_FORMATEAR_ANULACION" :
           return { 
                ...state,
                dataAnularInscripcion :{
                    ...state.dataAnularInscripcion,
                    idInscripcion : null,
                    monto_pagado : "",
                    metodo_pago : "",
                    modalAnular : false , 
                    texto : "",
                    carga : false,        
               },
               listoAnular : false,
               errorAnulacion : null
           }          
           
       case "SET_LISTADO_CUENTAS" : 
            return{ ...state , listadoCuentas : action.payload }   
    
       case "SET_INFO_DETALLE" :
            return{ ...state, dataInfoDetalle : action.payload }    
            
       case "SET_INFO_ANULAR" :
            return{ ...state, 
                dataAnularInscripcion :{
                    ...state.dataAnularInscripcion,
                    idInscripcion : action.payload.idInscripcion, 
                    modalAnular : action.payload.modalAnular , 
                    metodo_pago : action.payload.metodo_pago,
                    monto_pagado : action.payload.monto_pagado,
                    texto :  action.payload.texto        
                }
            }          
    };
};