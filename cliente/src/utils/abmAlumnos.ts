//import {  useContext} from "react";

//Seccion de contexto---------------------------------------
//import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/generales/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/generales/Formulario/Formulario";
import type { AlumnosResponse } from "../tipadosTs/alumnos";

//Seccion de servicios--------------------------------------
import { registroAlumno , listadoAlumnos, modAlumno , eliminarAlumno} from "../servicio/alumnos.fetch";

import { useAbmGenerico } from "../hooks/useAbmGenerico";

//  Datos para el filtro de buscaqueda
const inputsFiltro  : InputsPropsBuscador[] =[
    {
        name: "dni",
        label: "Dni",
        type: "number",
        placeholder: "Ingrese Dni",
        value: ""
    },
    {
        name: "apellido",
        label: "Apellido alumno",
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
        readonly : false,
        columnGroup: 1
    },
    {
        name: "apellido",
        label: "Apellido",
        type: "text",
        placeholder: "Ingrese Apellido",
        value: "",
        readonly : false,
        columnGroup: 2
    },
    {
        name: "nombre",
        label: "Nombre",
        type: "text",
        placeholder: "Ingrese Nombres",
        value: "",
        readonly : false,
        columnGroup: 1
    },
    {
        name: "celular",
        label: "Celular",
        type: "phone",
        placeholder: "+54 9 11 1234-5678",
        value: "",
        readonly : false,
        columnGroup: 1,
        contactPanel: true
    },
    {
        name: "email",
        label: "Correo Electrónico",
        type: "email",
        placeholder: "ejemplo@correo.com",
        value: "",
        readonly : false,
        columnGroup: 2,
        contactPanel: true
    }
];

const mapAlumnoForm =( dataM : any) =>({
    dni: dataM.Dni,
    apellido: dataM.Apellido,
    nombre: dataM.Nombre,
    email : dataM.Email,
    celular: dataM.Celular,
});

const mapAlumnoEliminar =( data : any) =>({
    dni: data.Dni
});

const mapTextoEliminar = (dataE: any) => 
    ` El estado del Alumno "${dataE.Nombre} ${dataE.Apellido}" (DNI: ${dataE.Dni}) cambiará`;



// Inicio del hook para logia abm alumnos
export const useAbmAlumnos = () =>{ 
// contexto
//const { rol } = useContext( RutasProtegidasContext );
  

const config = {
    recursoSingular : "Alumno",
    tituloPagina: "Mis Alumnos",

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
        email: '',
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