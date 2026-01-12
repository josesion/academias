import {  useContext} from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";
import type { PlanesUsuarioResponse } from "../tipadosTs/planes.usuarios";

//Seccion de servicios--------------------------------------
import { listadoPlanesUsuarios, eliminarPlanUsuario ,modPlanUsuario ,registroPlanesUsuario } from "../servicio/planes.usuarios";

import { useAbmGenerico } from "../hooks/useAbmGenerico";



//  Datos para el filtro de buscaqueda
const inputsFiltro  : InputsPropsBuscador[] =[

    {
        name: "descripcion",
        label: "Descripcion",
        type: "text",
        placeholder: "Ingrese Descripcion",
        value: ""
    }
];

// Datos para el formulario de alta 
const inputsPlanes : InputsPropsFormulario[] =[
    {
       name  : "id",
       label : "Id Plan (Se genera automaticamente) ",
       type  : "text",
       placeholder : "Se genera automaticamente",
       value : "",
       readonly : true
    },

    {
       name  : "descripcion",
       label : "Descripcion Plan",
       type  : "text",
       placeholder : "Ingrese el plan",
       value : "",
       readonly : false
    },
    {
        name : "cantidad_clases", 
        label : "Cantidad Clases",
        type  : "number",
        placeholder : "Ingrese cantidad clases",
        value : "" ,
        readonly : false
    },
    {
        name : "cantidad_meses", 
        label : "Cantidad Meses",
        type  : "number",
        placeholder : "Cantidad de Meses",
        value : "" ,
        readonly : false
    },
    {
        name : "monto", 
        label : "Monto Plan",
        type  : "number",
        placeholder : "Ingrese el monto ",
        value : "" ,
        readonly : false
    }
];

const mapPlanForm = ( dataM : any) =>({
    id              : dataM.id,
    descripcion     : dataM.descripcion,
    cantidad_clases : dataM.clases,
    cantidad_meses  : dataM.meses,
    monto           : dataM.monto

});



const mapPlanesEliminar =( data : any) =>({
    id: data.id 
});



const mapTextoEliminar = (dataE: any) => ` El estado del Plan : ${dataE.descripcion} cambiara`;

export const useAbmPlanesUsuarios = () =>{
// contexto
const { rol } = useContext( RutasProtegidasContext );

   const config = {
         recursoSingular : "Planes",

         idEscuela: rol?.escuela || 1 ,

         servicios : {
                registro    : registroPlanesUsuario,
                modificar   : modPlanUsuario,
                eliminar    : eliminarPlanUsuario,
                listado     : listadoPlanesUsuarios
         },

        inputsFormulario : inputsPlanes,
        inputsFiltro : inputsFiltro, 

        inicialFormData :{
            id : "",
            descripcion: '',
            clases: '',
            meses: "",
            monto: '',
        }, 

        estados: ["activos", "inactivos"],

        paginacion : { 
            pagina : 1,
            limite : 6,
            contadorPagina : 0
        },

        inicialFiltros : { 
            descripcion : "" 
        },

    mapDeFormulario : mapPlanForm, 
    mapDataEliminar : mapPlanesEliminar, 
    mapTextoEliminar: mapTextoEliminar 

   } 

    return useAbmGenerico<PlanesUsuarioResponse>(config);
};
