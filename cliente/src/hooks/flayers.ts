import { useReducer } from "react";
import { initialFlayers, flayerReducer } from "../reducers/flayer.reducer"; 

import {type Valores } from "../componentes/Flayers/FormularioFlayer/FormularioFlayer";
import { type PropsPostFlayer } from "../servicio/flayer";
import {type  ErroresDetalle } from "../componentes/Flayers/FormularioFlayer/FormularioFlayer";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface FlayersProps {

    servicios : {
        getCarrucel : ServicioCrud,
        postFlayer  : ServicioCrud
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

    //console.log(state.errorDetalles)

const handleSubmit =async (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
       //console.log("s")
    const { imagen, valoresFormulario} = state;

    if (
        !valoresFormulario.flayer_titulo.trim() || 
        !valoresFormulario.descripcion_titulo.trim() || 
        !imagen
    ) {
       // console.log("Formulario incompleto: hay campos vacíos o falta la imagen");
    } else {
        try{
            //console.log("¡Formulario completo!");
            const subirImagen = config.servicios.postFlayer;

            const data : PropsPostFlayer = {
                imagen : imagen,
                titulo : valoresFormulario.flayer_titulo,
                descripcion : valoresFormulario.descripcion_titulo,
                plan : config.plan    
            }
            console.log(data)
            const  resultSubirImagen = await subirImagen(data); 
            console.log(resultSubirImagen)
       
            if (resultSubirImagen.errorsDetails) {
                    console.log(2)
                resultSubirImagen.errorsDetails.forEach((item : any) => {
                    console.log("campo", item.campo, "mensaje", item.message);
                    
                    dispatch({
                        type: "SET_DETALLE_ERRORES",
                        payload: {
                            campo: item.campo as keyof ErroresDetalle,
                            valor: item.message // o item.mensaje, según cómo te lo devuelva el backend
                        }
                    });
                });
            }  

        }catch(error){
            console.log(error)
        }finally{

        }
    }

};


  return {
    state, 
    cachearFormulario,
    cachearImagen, 
    quitarImagen,
    handleSubmit
  }

};