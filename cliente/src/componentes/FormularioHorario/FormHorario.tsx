import { SelectorPlegable } from "../Selector/Selector";

import type * as TipadoHorario from"../../tipadosTs/horario";

interface FormHorarioProps {
    profesores : TipadoHorario.DataProfesor | null ,
    listaProfe : TipadoHorario.DataProfesor[],

    nilveles : TipadoHorario.DataNivel | null ,
    listaNiveles : TipadoHorario.DataNivel[],

    tipo : TipadoHorario.DataTipo | null ,
    listaTipo : TipadoHorario.DataTipo[],

    handleCachearProfesores: ( e: React.ChangeEvent<HTMLInputElement> ) => void ;
    handleCachearNiveles: ( e: React.ChangeEvent<HTMLInputElement> ) => void ;
    handleCachearTipos: ( e: React.ChangeEvent<HTMLInputElement> ) => void ;
}


export const FormHorario: React.FC<FormHorarioProps> = ( props) => {

  const {  listaProfe, listaNiveles, listaTipo,
           handleCachearProfesores ,  handleCachearNiveles, handleCachearTipos } = props;

       console.log( listaTipo );    
  return (
    <div className="contenedor_formulario_horario">

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
        <div className="formulario_horario_filtro_secundario">
                <p>secundario</p>
        </div>

        <div className="formulario_horario_lista">
             <p>horarios</p>
        </div>

    </div>
  );
}