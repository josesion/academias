import { type ErroresDetalle , type Valores} from "../componentes/Flayers/FormularioFlayer/FormularioFlayer";

export interface FlayersTipado {

    errorGenericos : string | null,
    carga : boolean,
    modalConfirmacion : boolean,

    errorDetalles : ErroresDetalle,
    imagen : File | null
    valoresFormulario : Valores

};


export const initialFlayers = ( ) :FlayersTipado =>({

    errorGenericos : null,
    carga : false,
    modalConfirmacion : false,

    errorDetalles : {
        imagen : null,
        titulo : null,
        descripcion : null
    },

    imagen : null,

    valoresFormulario :{
        flayer_titulo : "",
        descripcion_titulo : ""
    }

});


export type FlayersAction =  
| { type: 'SET_FORMULARIO'; payload: { campo: keyof Valores; valor: string } }
| { type: "SET_DETALLE_ERRORES"; payload : { campo : keyof ErroresDetalle; valor : string | null }}
| { type: "SET_IMAGEN"   ; payload : File | null }
| { type : "SET_ERROR_GENERICO" , payload : string | null}
| { type : "SET_CARGA", payload : boolean }
| { type : "SET_MODAL", payload : boolean }
| { type: "RESET_FORMULARIO" };

export const flayerReducer = ( state : ReturnType< typeof initialFlayers>, action : FlayersAction)
:ReturnType<typeof initialFlayers> =>{

    switch( action.type) {

case 'SET_FORMULARIO':
    return {
        ...state,
        valoresFormulario: {
            ...state.valoresFormulario,
            [action.payload.campo]: action.payload.valor, // Actualiza solo el campo enviado
        },
    }; 
    
case 'SET_DETALLE_ERRORES':
    return {
        ...state,
        errorDetalles: {
            ...state.errorDetalles,
            [action.payload.campo]: action.payload.valor, // Actualiza solo el campo enviado
        },
    };    

case "SET_IMAGEN" : 
    return {
        ...state,
        imagen : action.payload
    };

case "SET_ERROR_GENERICO" :
     return{ 
        ...state,
        errorGenericos : action.payload
     };

case "SET_CARGA" : 
    return{
        ...state,
        carga : action.payload
    }     

case "SET_MODAL" : 
    return{
        ...state,
        modalConfirmacion : action.payload
    };

case "RESET_FORMULARIO":
            return {
                ...initialFlayers(), // Trae todo por defecto (vacío/nulo)
                carga: state.carga,  // Pero preserva el estado de carga actual
                modalConfirmacion: state.modalConfirmacion, // Mantiene el modal intacto
            };
                
        default:
                return state; 
    };
}    