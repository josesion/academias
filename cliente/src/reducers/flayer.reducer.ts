import { type ErroresDetalle , type Valores} from "../componentes/Flayers/FormularioFlayer/FormularioFlayer";

export interface FlayersTipado {

   // errorGenericos :{},
    errorDetalles : ErroresDetalle,
    imagen : File | null
    valoresFormulario : Valores

};


export const initialFlayers = ( ) :FlayersTipado =>({

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

        default:
                return state; 
    };

}    