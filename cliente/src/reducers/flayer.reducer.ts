import { type ErroresDetalle, type Valores } from "../componentes/Flayers/FormularioFlayer/FormularioFlayer";
import { type ReturnCarrucel } from "../servicio/flayer";

export interface FlayersTipado {
    errorGenericos: {
        postImagen: string | null;
        galeria   : string | null;
        borrar : string | null; 
        // Acá podés sumar más errores genéricos en el futuro
    };
    carga: {
        postImagen: boolean;
        galeria : boolean;
        borrar : boolean;
        // Acá podés sumar más estados de carga en el futuro
    };
    modalConfirmacion: boolean;
    modalFormulario : boolean;
    modalConfirmacionEliminar : boolean;    


    errorDetalles: ErroresDetalle;
    imagen: File | null;
    valoresFormulario: Valores;
    carrucelAbm : ReturnCarrucel[] | null,

    planFlayers : number,
    actualizar : number,
}

export const initialFlayers = (): FlayersTipado => ({
    errorGenericos: {
        postImagen: null,
        galeria   : null ,
        borrar    : null,
    },
    carga: {
        postImagen: false,
        galeria   : false,
        borrar    : false,
    },
    modalConfirmacion: false,
    modalFormulario : false,
    modalConfirmacionEliminar : false, 
    
    errorDetalles: {
        imagen: null,
        titulo: null,
        descripcion: null,
    
    },
    imagen: null,
    valoresFormulario: {
        flayer_titulo: "",
        descripcion_titulo: "",
    },

    carrucelAbm : null,

    planFlayers : 0,
    actualizar : 1,
});

export type FlayersAction =  
| { type: 'SET_FORMULARIO'; payload: { campo: keyof Valores; valor: string } }
| { type: "SET_CARRUCEL_AMB"; payload :  ReturnCarrucel[] | null}
| { type: "SET_DETALLE_ERRORES"; payload: { campo: keyof ErroresDetalle; valor: string | null } }
| { type: "SET_IMAGEN"; payload: File | null }
| { type: "SET_ERROR_GENERICO"; payload: { campo: keyof FlayersTipado['errorGenericos']; valor: string | null } }
| { type: "SET_CARGA"; payload: { campo: keyof FlayersTipado['carga']; valor: boolean } }
| { type: "SET_MODAL"; payload: boolean }
| { type: "SET_MODAL_FORMULARIO"; payload: boolean }
| { type: "SET_MODAL_ELIMINAR"; payload: boolean }
| { type : "SET_PLAN_FLAYERS", payload : number } 
| { type : "SET_ACTUALIZAR" }
| { type: "RESET_FORMULARIO" };

export const flayerReducer = (state: ReturnType<typeof initialFlayers>, action: FlayersAction): ReturnType<typeof initialFlayers> => {
    switch (action.type) {
        case 'SET_FORMULARIO':
            return {
                ...state,
                valoresFormulario: {
                    ...state.valoresFormulario,
                    [action.payload.campo]: action.payload.valor,
                },
            }; 

        case "SET_CARRUCEL_AMB" : 
            return{
                ...state,
                carrucelAbm : action.payload
            }    
            
        case 'SET_DETALLE_ERRORES':
            return {
                ...state,
                errorDetalles: {
                    ...state.errorDetalles,
                    [action.payload.campo]: action.payload.valor,
                },
            };      

        case "SET_IMAGEN": 
            return {
                ...state,
                imagen: action.payload,
            };

        case "SET_ERROR_GENERICO":
            return { 
                ...state,
                errorGenericos: {
                    ...state.errorGenericos,
                    [action.payload.campo]: action.payload.valor,
                },
            };

        case "SET_CARGA": 
            return {
                ...state,
                carga: {
                    ...state.carga,
                    [action.payload.campo]: action.payload.valor,
                },
            };      

        case "SET_MODAL": 
            return {
                ...state,
                modalConfirmacion: action.payload,
            };

        case "SET_MODAL_FORMULARIO": 
            return {
                ...state,
                modalFormulario: action.payload,
            };   
            
        case "SET_MODAL_ELIMINAR": 
            return {
                ...state,
                modalConfirmacionEliminar: action.payload,
            };  
            
        case "SET_PLAN_FLAYERS" :
            return {
                ...state,
                planFlayers : action.payload
            };
          
        case "SET_ACTUALIZAR" :
            return {
                ...state,
                actualizar:  state.actualizar + 1
            };            

        case "RESET_FORMULARIO":
            return {
                ...initialFlayers(), // Restablece todo por defecto
                carga: state.carga,  // Preserva el estado de carga actual
                modalConfirmacion: state.modalConfirmacion, // Mantiene el modal intacto
                carrucelAbm: state.carrucelAbm,
                planFlayers : state.planFlayers,
            };
                
        default:
            return state; 
    }
};