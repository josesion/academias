import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";
import type { NivelData } from "../tipadosTs/nivel";


//Seccion de servicios--------------------------------------
import { registroNivel, modNivel ,estadoNivel , listadoNivel } from "../servicio/nivel.fetch";

import { useAbmGenerico } from "../hooks/useAbmGenerico";


//  Datos para el filtro de busqueda
const inputsFiltro : InputsPropsBuscador[] = [

    {
        name        : "nivel",
        label       : "Nivel descripcion",
        type        : "text",
        placeholder : "Ingrese el nivel",
        value       : "",
    }   
];

// Datos para el formulario de alta 
const inputsNivel : InputsPropsFormulario[] =[
    {
        name        : "nivel",
        label       : "Nivel descripcion",
        type        : "text",
        placeholder : "Ingrese el Nivel ",
        value       : "",
        readonly    : false,
    },
];

const mapNivelForm = ( dataM : any) =>({
    id : dataM.id,
    nivel : dataM.nivel
});

const mapNivelEliminar = ( data : any) =>({
    id: data.id,
    nivel : data.nivel 
}); 

const mapTextoEliminar = (dataE: any) => ` El estado de Nivel : ${dataE.id} cambiara`;

export const useAbmNivelUsuarios = () =>{

   const { rol } = useContext( RutasProtegidasContext ); 

     const config ={
        recursoSingular : "Nivel Usuario",
        idEscuela: rol?.escuela || 1 ,
        
    servicios : {
            registro    : registroNivel,
            modificar   : modNivel,
            eliminar    : estadoNivel,
            listado     : listadoNivel
        },

        inputsFormulario : inputsNivel,
        inputsFiltro : inputsFiltro, 
        
        estados: ["activos", "inactivos"],
        
        inicialFormData : {
            nivel        : "",
        },

        paginacion : { 
            pagina : 1,
            limite : 6,
            contadorPagina : 0
        },

        inicialFiltros : {
            nivel      : ""
        },

        mapDeFormulario : mapNivelForm, 
        mapDataEliminar : mapNivelEliminar, 
        mapTextoEliminar: mapTextoEliminar,        

     };

    return useAbmGenerico<NivelData>(config); 
};