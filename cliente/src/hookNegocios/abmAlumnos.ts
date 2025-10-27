import {  useContext} from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";
import type { AlumnosResponse } from "../tipadosTs/alumnos";

//Seccion de servicios--------------------------------------
import { registroAlumno , listadoAlumnos, modAlumno , eliminarAlumno} from "../servicio/alumnos.fetch";

import { useAbmGenerico } from "../hooks/useAbmGenerico";

//  Datos para el filtro de buscaqueda
const inputsFiltro  : InputsPropsBuscador[] =[
    {
        name: "dni",
        label: "Dni Alumno",
        type: "number",
        placeholder: "Ingrese Dni",
        value: ""
    },
    {
        name: "apellido",
        label: "Apellido",
        type: "text",
        placeholder: "Ingrese Apellido",
        value: ""
    }
    
]
// Datos para el formulario de alta 
const inputsAlumnos : InputsPropsFormulario[] = [
    {
        name: "dni",
        label: "Dni Alumno",
        type: "number",
        placeholder: "Ingrese Dni",
        value: "",
        readonly : false 
    },
    {
        name: "apellido",
        label: "Apellido",
        type: "text",
        placeholder: "Ingrese Apellido",
        value: "",
        readonly : false 
    },
    {
        name: "nombre",
        label: "Nombre",
        type: "text",
        placeholder: "Ingrese Nombres",
        value: "",
        readonly : false 
    },
    {
        name: "celular",
        label: "Celular",
        type: "number",
        placeholder: "Ej : 3875450376",
        value: "",
        readonly : false 
    }
];

const mapAlumnoForm =( dataM : any) =>({
    dni: dataM.Dni,
    apellido: dataM.Apellido,
    nombre: dataM.Nombre,
    celular: dataM.Celular,
});

const mapAlumnoEliminar =( data : any) =>({
    dni: data.Dni
});

const mapTextoEliminar = (dataE: any) => 
    ` El estado Alumno : ${dataE.Dni} cambiara`;



// Inicio del hook para logia abm alumnos
export const useAbmAlumnos = () =>{ 
// contexto
const { rol } = useContext( RutasProtegidasContext );
  

const config = {
    recursoSingular : "Alumno",

    

    idEscuela : rol?.escuela || 1 ,

    servicios : {
        registro : registroAlumno,
        modificar : modAlumno,
        eliminar : eliminarAlumno,
        listado : listadoAlumnos
    },
    inputsFormulario : inputsAlumnos,
    inputsFiltro : inputsFiltro,
    
    inicialFormData :{
        dni: '',
        apellido: '',
        nombre: '',
        celular: ""
    },

    estados: ["activos", "inactivos"],

    paginacion : { 
        pagina : 1,
        limite : 6,
        contadorPagina : 0
    },

    inicialFiltros : { 
        dni : "", 
        apellido : "" 
    },

    mapDeFormulario : mapAlumnoForm, 
    mapDataEliminar : mapAlumnoEliminar, 
    mapTextoEliminar: mapTextoEliminar 
}

    return useAbmGenerico<AlumnosResponse>(config);
}