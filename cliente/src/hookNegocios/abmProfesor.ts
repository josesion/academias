//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/generales/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/generales/Formulario/Formulario";
import type { ProfesoresData } from "../tipadosTs/profesores";

//Seccion de servicios--------------------------------------
import { altaProfesor , bajaProfesor , modProfesor , listadoProfesores } from "../servicio/profesor.usuarios";
import { useAbmGenerico } from "../hooks/useAbmGenerico";


//  Datos para el filtro de busqueda
const inputsFiltro : InputsPropsBuscador[] = [
    {
        name        : "dni",
        label       : "DNI Profesor",
        type        : "number",
        placeholder : "Ingrese DNI",
        value       : "",
    } ,
    {
        name        : "apellido",
        label       : "Apellido Profesor",
        type        : "text",
        placeholder : "Ingrese Apellido",
        value       : "",
    }
]; 
// Datos para el formulario de alta
const inputsProfesor : InputsPropsFormulario[] = [
    {
        name        : "dni",
        label       : "DNI Profesor",
        type        : "number",
        placeholder : "Ingrese DNI",
        value       : "",
        readonly    : false,
        columnGroup : 1,
    },
    {
        name        : "apellido",
        label       : "Apellido Profesor",
        type        : "text",
        placeholder : "Ingrese Apellido",
        value       : "",
        readonly    : false,
        columnGroup : 2,
    },
    {
        name        : "nombre",
        label       : "Nombre Profesor",
        type        : "text",
        placeholder : "Ingrese Nombre",
        value       : "",
        readonly    : false,
        columnGroup : 1,
    },
    {
        name        : "celular",
        label       : "Celular Profesor",
        type        : "phone",
        placeholder : "+54 9 11 1234-5678",
        value       : "",
        readonly    : false,
        columnGroup : 1,
        contactPanel: true,
    }

];


const mapProfesorForm  = ( dataM : any) => ({
    dni      : dataM.dni,
    nombre   : dataM.nombre,
    apellido : dataM.apellido,
    celular  : dataM.celular,
});

const mapProfesorEliminar = ( data : any) =>({
    dni        : data.dni,
});


const mapTextoEliminar = (dataE: any) => ` El estado del Profesor "${dataE.nombre} ${dataE.apellido}" (DNI: ${dataE.dni}) cambiará`;


export const useAbmProfesoresUsuarios = () => {

    const config ={
        recursoSingular : "Profesor",
        tituloPagina: "Profesores de la Escuela",


         servicios : {
                registro    : altaProfesor,
                modificar   : modProfesor,
                eliminar    : bajaProfesor,
                listado     : listadoProfesores
         },

        inputsFormulario : inputsProfesor,
        inputsFiltro : inputsFiltro,   
        
        estados: ["activos", "inactivos"],

        inicialFormData : {
            dni        : "",
            nombre     : "",
            apellido   : "",
            celular    : "",
        },

        paginacion : { 
            pagina : 1,
            limite : 6,
            contadorPagina : 0
        },

        inicialFiltros : {
            dni      : "",
            apellido : ""
        },


        mapDeFormulario : mapProfesorForm, 
        mapDataEliminar : mapProfesorEliminar, 
        mapTextoEliminar: mapTextoEliminar,        

    };


    return useAbmGenerico<ProfesoresData>(config);
} ;