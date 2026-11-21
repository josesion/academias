//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/generales/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/generales/Formulario/Formulario";
import type { DataSala } from "../tipadosTs/sala";


//Seccion de servicios--------------------------------------
import { crearSala, modificarSala, estadoSala, listadoSala } from "../servicio/salas.fetch";

import { useAbmGenerico } from "../hooks/useAbmGenerico";


//  Datos para el filtro de busqueda
const inputsFiltro : InputsPropsBuscador[] = [

    {
        name        : "nombre",
        label       : "Sala nombre",
        type        : "text",
        placeholder : "Ingrese el nombre",
        value       : "",
    }   
];

// Datos para el formulario de alta 
const inputsSala : InputsPropsFormulario[] =[
    {
        name        : "nombre",
        label       : "Sala nombre",
        type        : "text",
        placeholder : "Ingrese el nombre ",
        value       : "",
        readonly    : false,
    },
    {
        name        : "capacidad",
        label       : "Capacidad",
        type        : "number",
        placeholder : "Personas (opcional)",
        value       : "",
        readonly    : false,
    },
];

const mapSalaForm = ( dataM : any) =>({
    id : dataM.id,
    nombre : dataM.nombre,
    capacidad : dataM.capacidad || ""
});

const mapSalaEliminar = ( data : any) =>({
    id: data.id,
    nombre : data.nombre 
}); 

const mapTextoEliminar = (dataE: any) => ` El estado de la Sala "${dataE.nombre}" cambiará`;

export const useAbmSalaUsuarios = () =>{

     const config ={
        recursoSingular : "Sala",
        tituloPagina: "Salas",
         
    servicios : {
            registro    : crearSala,
            modificar   : modificarSala,
            eliminar    : estadoSala,
            listado     : listadoSala
        },

        inputsFormulario : inputsSala,
        inputsFiltro : inputsFiltro, 
        
        estados: ["activos", "inactivos"],
        
        inicialFormData : {
            nombre       : "",
            capacidad    : "",
        },

        paginacion : { 
            pagina : 1,
            limite : 6,
            contadorPagina : 0
        },

        inicialFiltros : {
            nombre     : ""
        },

        mapDeFormulario : mapSalaForm, 
        mapDataEliminar : mapSalaEliminar, 
        mapTextoEliminar: mapTextoEliminar,        

     };

    return useAbmGenerico<DataSala>(config); 
};
