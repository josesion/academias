import { useReducer} from "react";
import { initialFlayers, flayerReducer, type FlayersAction } from "../reducers/flayer.reducer"; 

import {type Valores } from "../componentes/Flayers/FormularioFlayer/FormularioFlayer";
import { type PropsPostFlayer } from "../servicio/flayer";
import {type  ErroresDetalle } from "../componentes/Flayers/FormularioFlayer/FormularioFlayer";

import { useEffectServicio } from "../utils/useEfectServicio";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface FlayersProps {

    servicios : {
        getCarrucel : ServicioCrud,
        postFlayer  : ServicioCrud,
        getAllEscuelas : ServicioCrud,
        getFlayersEscuela : ServicioCrud,
        deletFlayerEscuela : ServicioCrud,
    },

    plan : number
};


export const useFlayer = ( config : FlayersProps) =>{

 const [state, dispatch] = useReducer(flayerReducer, initialFlayers());  

 const cachearFormulario = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: 'SET_FORMULARIO',
      payload: {
        campo: name as keyof Valores,
        valor: value,
      },
    });
  };

const cachearImagen = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const archivo = e.target.files?.[0] || null; 
    dispatch({
        type : "SET_IMAGEN" ,
        payload : archivo
    });
};  

const quitarImagen = () =>{
    dispatch({
        type : "SET_IMAGEN",
        payload :  null
    });
};

const abrirFormulario = () =>{
    dispatch({type : "SET_MODAL_FORMULARIO", payload : true});
};

const cerrarFormulario = () =>{
    dispatch({type : "SET_MODAL_FORMULARIO", payload : false});
};

const handleSubmit =async (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const { imagen, valoresFormulario} = state;

    if (
        !valoresFormulario.flayer_titulo.trim() || 
        !valoresFormulario.descripcion_titulo.trim() || 
        !imagen
    ) {
       dispatch({
        type : "SET_ERROR_GENERICO", payload : { campo : "postImagen", valor : "Formulario incompleto: hay campos vacíos o falta la imagen" }
       });
    } else {
        try{
       
            dispatch({ type : "SET_CARGA" , payload : { campo : "postImagen" , valor : true}});

            const subirImagen = config.servicios.postFlayer;

            const data : PropsPostFlayer = {
                imagen : imagen,
                titulo : valoresFormulario.flayer_titulo,
                descripcion : valoresFormulario.descripcion_titulo,
                plan : config.plan    
            }

            const  resultSubirImagen = await subirImagen(data); 
      
    
            if( resultSubirImagen.code === "FLAYER_OK"){
                dispatch({ type : "RESET_FORMULARIO"});
                dispatch({ type : "SET_MODAL", payload : true});
            };

            if ( resultSubirImagen.code === 'SIN_PERMISOS' ){
                dispatch({ type :"SET_ERROR_GENERICO", payload : { campo : "postImagen", valor : resultSubirImagen.message}});
            };             
       
            if (resultSubirImagen.errorsDetails) {        
                resultSubirImagen.errorsDetails.forEach((item : any) => {     
                dispatch({
                    type: "SET_DETALLE_ERRORES",
                    payload: {
                        campo: item.campo as keyof ErroresDetalle,
                        valor: item.message // o item.mensaje, según cómo te lo devuelva el backend
                    }
                });
            });

         


        };  

        }catch(error){
            dispatch({ type : "SET_ERROR_GENERICO" , payload : { campo : "postImagen" , valor : "Error en el servidor"}});
            console.error(error)
        }finally{
            dispatch({ type : "SET_CARGA" , payload : { campo : "postImagen" , valor : false}});
        };
    }

};

const handleElimnarFlayer = ( id_flayer : number ) =>{
    console.log(id_flayer)
}

const handleCerrarModal = () =>{
    dispatch({ type : "SET_MODAL", payload : false});
};


useEffectServicio<any , any, FlayersAction>({
    servicios : config.servicios.getFlayersEscuela,
    dispatch : dispatch,
    accionCarga : ( carga ) => ({ type : "SET_CARGA", payload :{ campo : "galeria", valor : carga}}),
    accionError : ( mensaje ) =>({ type : "SET_ERROR_GENERICO" , payload : { campo : "galeria" , valor : mensaje}}),
    accionResultado : ( data )=>({ type : "SET_CARRUCEL_AMB", payload : data}),
    useAbort : true,
    dependencias :[]
});


  return {
    state, 
    cachearFormulario,
    cachearImagen, 
    quitarImagen,
    handleSubmit,
    handleElimnarFlayer,
    handleCerrarModal,
    abrirFormulario, cerrarFormulario,

  }

};