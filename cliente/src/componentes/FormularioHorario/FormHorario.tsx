import { SelectorPlegable } from "../Selector/Selector";
import { Calendario } from "../Calendario/Calendario";


import type * as TipadoHorario from"../../tipadosTs/horario";
import { type ClaseHorario } from "../ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../CeldaVacia/CeldaVacia";
import {type Horas , type DiaSemana } from "../../tipadosTs/horario";

import "./formHorario.css";

interface FormHorarioProps {
    modalInterno?: boolean;    

    profesores : TipadoHorario.DataProfesor | null ,
    listaProfe : TipadoHorario.DataProfesor[],

    nilveles : TipadoHorario.DataNivel | null ,
    listaNiveles : TipadoHorario.DataNivel[],

    tipo : TipadoHorario.DataTipo | null ,
    listaTipo : TipadoHorario.DataTipo[],

    horarios : Horas[] ,
    diasSemana : DiaSemana[],

    handleCachearProfesores: ( e: React.ChangeEvent<HTMLInputElement> ) => void ;
    handleCachearNiveles: ( e: React.ChangeEvent<HTMLInputElement> ) => void ;
    handleCachearTipos: ( e: React.ChangeEvent<HTMLInputElement> ) => void ;
    handleMod: (clase : ClaseHorario) => void;
    handleAlta: ( mensaje  : MensajeCelda )=> void;
}


export const FormHorario: React.FC<FormHorarioProps> = ( props ) => {

  const {  modalInterno,
           listaProfe, listaNiveles, listaTipo,
           handleCachearProfesores ,  handleCachearNiveles, handleCachearTipos,
           handleMod,handleAlta,
           diasSemana , horarios
        } = props;


  return (
    <div className="contenedor_formulario_horario">
        {
           modalInterno &&     
                <div className="formulario_overlay">
                        <div className="formulario_horario_filtro_primario">

                                <SelectorPlegable<TipadoHorario.DataProfesor > 
                                        titulo="Profesores"
                                        objetoListado={ listaProfe} 
                                        onChange={ handleCachearProfesores}
                                        input_list="list_profesores"
                                        valueKey="dni"
                                        tipo="text"
                                        name="dni"
                                        displayKey="persona"
                                />

                                <SelectorPlegable<TipadoHorario.DataNivel > 
                                        titulo="Niveles"
                                        objetoListado={ listaNiveles} 
                                        onChange={ handleCachearNiveles }
                                        input_list="list_niveles"
                                        valueKey="nivel"
                                        tipo="text"
                                        name="nivel"
                                />

                                <SelectorPlegable<TipadoHorario.DataTipo > 
                                        titulo="Tipos"
                                        objetoListado={ listaTipo } 
                                        onChange={ handleCachearTipos }
                                        input_list="list_tipos"
                                        valueKey="tipo"
                                        tipo="text"
                                        name="tipo"
                                />
                        </div>
                </div> 
        }


        <div className="formulario_horario_filtro_secundario">
                <Calendario 
                    diasSemana={diasSemana}
                    horarios={horarios}    
                    handleModData={handleMod}
                    handleAlaData={handleAlta}  
                />
        </div>



    </div>
  );
}