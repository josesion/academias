import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";

//Seccion de servicios--------------------------------------
import { registroTipo , modTipo , estadoTipo , listado } from "../servicio/tipo.fetch";

import { useAbmGenerico } from "../hooks/useAbmGenerico";



//  Datos para el filtro de busqueda
const inputsFiltro : InputsPropsBuscador[] = [
    {
        name        : "tipo",
        label       : "Tipo descripcion",
        type        : "text",
        placeholder : "Ingrese el Tipo",
        value       : "",
    }   
];

// Datos para el formulario de alta 
const inputsTipo : InputsPropsFormulario[] =[
    {
        name        : "tipo",
        label       : "Tipo descripcion",
        type        : "text",
        placeholder : "Ingrese el Tipo ",
        value       : "",
        readonly    : false,
    },
];

const mapTipoForm = ( dataM : any) =>({
    id : dataM.id,
    tipo : dataM.nivel
});

const mapTipoEliminar = ( data : any) =>({
    id: data.id,
    tipo : data.nivel 
}); 

const mapTextoEliminar = (dataE: any) => ` El estado de Nivel : ${dataE.id} cambiara`;

export const useAbmTipoUsuarios = () =>{

    const { rol } = useContext( RutasProtegidasContext ); 

     const config = {
        recursoSingular : "Tipo Usuario",
        idEscuela: rol?.escuela || 1 , 
        
        servicios : {
                registro    : registroTipo,
                modificar   : modTipo,
                eliminar    : estadoTipo,
                listado     : listado
        },

        inputsFormulario : inputsTipo,
        inputsFiltro : inputsFiltro, 
        
        estados: ["activos", "inactivos"],  
        
        inicialFormData : {
            tipo        : "",
        }, 
        
        paginacion : { 
            pagina : 1,
            limite : 6,
            contadorPagina : 0
        },
        
        inicialFiltros : {
            tipo      : ""
        },  
        
        mapDeFormulario : mapTipoForm, 
        mapDataEliminar : mapTipoEliminar, 
        mapTextoEliminar: mapTextoEliminar,            

     }

     return useAbmGenerico<{tipo : string}>(config); 
};