import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";
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
    },
    {
        name        : "nombre",
        label       : "Nombre Profesor",
        type        : "text",
        placeholder : "Ingrese Nombre",
        value       : "",
        readonly    : false,
    },
    {
        name        : "apellido",
        label       : "Apellido Profesor",
        type        : "text",
        placeholder : "Ingrese Apellido",
        value       : "",
        readonly    : false,
    },
    {
        name        : "celular",
        label       : "Celular Profesor",
        type        : "number",
        placeholder : "Ingrese Celular",
        value       : "",
        readonly    : false,
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


const mapTextoEliminar = (dataE: any) => ` El estado del Profesor : ${dataE.dni} cambiara`;


export const useAbmProfesoresUsuarios = () => {

    const { rol } = useContext( RutasProtegidasContext );

    const config ={
        recursoSingular : "Profesor Usuario",

        idEscuela: rol?.escuela || 1 ,

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