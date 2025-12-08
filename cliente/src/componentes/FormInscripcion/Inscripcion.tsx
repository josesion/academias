
//Componentes
import { SelectorPlegable } from "../Selector/Selector";
import { TarjetaInscripcion } from "../TarjetaInscripcion/TarjetaInscripcion";
import { Boton } from "../Boton/Boton";

//Typado
import { type DataAlumno ,type DataPlan} from "../../hooks/inscripcion";


import './formInscripcion.css'





interface InscripcionProps {
    plan : DataPlan | null ,
    alumno : DataAlumno | null ,

    listadoPlan : any[],
    listadoAlumno : any[],

    handleCachearPlan: (e: React.ChangeEvent<HTMLInputElement>) => void ;
    handleCachearAlumno: (e: React.ChangeEvent<HTMLInputElement>) => void ;

    inscribir:( e : React.FormEvent<HTMLFormElement>)=> void ;
    cancelar:( e :  React.MouseEvent<HTMLButtonElement>)=> void ;
};


export const InscripcionForm : React.FC<InscripcionProps> = ( props ) =>{

    const { plan , alumno,
            listadoPlan, listadoAlumno,
            handleCachearPlan , handleCachearAlumno,
            inscribir , cancelar
        } = props;
 

   
    return(
       <form className="formulario_inscripcion_contenedor"
             onSubmit={inscribir}
       >
            <p className="formulario_inscripcion_titulo">Contratación e Pago Inicial del Plan</p>
            <div className="formulario_inscripcion_filtros">

                    <SelectorPlegable 
                            titulo="Planes activos"
                            objetoListado={listadoPlan} 
                            onChange={ handleCachearPlan}
                            input_list="list_planes"
                            valueKey="descripcion"
                            tipo="text"
                            name="descripcion"
                    />

                    <SelectorPlegable 
                            titulo="Alumnos activos "
                            objetoListado={listadoAlumno} 
                            onChange={handleCachearAlumno}
                            input_list="list_alumnos"
                            valueKey="dni"
                            displayKey="persona"
                            tipo="text"
                            name="dni"
                    />
            </div>

            <div className="formulario_inscripcion_info">
                <TarjetaInscripcion
                    plan={plan}
                    alumno={alumno}
                />
            </div>

            <div className="formulario_inscripcion_botones">
                <Boton
                    texto="Confirmar Inscripcion y Pagar"
                    logo="Add"
                    clase="aceptar"
                    focus = {false}  
                    
                />

                <Boton
                    texto="Cancelar"
                    logo="Cancel"
                    clase="cancelar"
                    focus = {false}    
                    onClick={cancelar} 
                />
            </div>
            

       </form>
    )

}