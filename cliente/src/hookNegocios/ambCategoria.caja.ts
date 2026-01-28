import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";
import type { DataCategoria } from "../tipadosTs/categorias.cajas.typado";

//Seccion de servicios--------------------------------------
import { altaCategoriaCaja, modCategoriaCaja, bajaCategoriaCaja, listadoCategoriaCaja } from "../servicio/categoria.caja.fetch";
import { useAbmGenerico } from "../hooks/useAbmGenerico";

const inputsCategoriaCaja : InputsPropsFormulario[] = [
    {
        name        : "nombre_categoria",
        label       : "Ingresar Categoria",
        type        : "text",
        placeholder : "Ingrese Categoria",
        value       : "",
        readonly    : false,
    },   
    
    {
        name        : "tipo_movimiento",
        label       : "Ingresar Tipo",
        type        : "text",
        options     : ["ingreso", "egreso"],
        readonly    : false,
    },  

];

const inputsFiltro : InputsPropsBuscador[] = [
    {
        name        : "nombre_categoria",
        label       : "Ingresar Categoria",
        type        : "text",
        placeholder : "Ingrese Categoria",
        value       : "",
    } ,    

    {
        name: "tipo_movimiento", 
        label: "Tipo",
        type: "text",
        options: ["todos", "ingreso", "egreso"],
  },
];


const mapCategiriaForm  = ( dataM : any) => ({
    id_categoria : dataM.id_categoria,
    nombre_categoria      : dataM.nombre_categoria,
    tipo_movimiento       : dataM.tipo_movimiento,
});

const mapCategiriaEliminar = ( data : any) =>({
    id_categoria : data.id_categoria,
    nombre_categoria : data.nombre_categoria
});

const mapTextoEliminar = (dataE: any) => ` El estado Categoria : ${dataE.id_categoria} cambiara`

export const setAbmCategoriaCaja = () => {

    const { rol } = useContext( RutasProtegidasContext );   

    const config = {

        recursoSingular : "Categoria Caja", 
        
        idEscuela: rol?.escuela || 1 ,
       
        servicios : {
            registro : altaCategoriaCaja,
            modificar : modCategoriaCaja,
            eliminar  : bajaCategoriaCaja,
            listado   : listadoCategoriaCaja
        },

        inputsFormulario : inputsCategoriaCaja,
        inputsFiltro : inputsFiltro,

        estados: ["activos", "inactivos"],

        paginacion : { 
            pagina : 1,
            limite : 6,
            contadorPagina : 0
        },

        inicialFormData : {
            nombre_categoria  : "",
            tipo_movimiento   : "ingreso"
        },

        inicialFiltros : {
            nombre_categoria : "",
            tipo_movimiento   : "%"
        },

        mapDeFormulario : mapCategiriaForm, 
        mapDataEliminar : mapCategiriaEliminar, 
        mapTextoEliminar: mapTextoEliminar,     
    }; 

 return useAbmGenerico<DataCategoria>(config); 
};