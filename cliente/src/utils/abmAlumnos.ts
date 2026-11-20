//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/generales/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/generales/Formulario/Formulario";
import type { AlumnosResponse } from "../tipadosTs/alumnos";

//Seccion de servicios--------------------------------------
import { registroAlumno , listadoAlumnos, modAlumno , eliminarAlumno} from "../servicio/alumnos.fetch";

import { useAbmGenerico } from "../hooks/useAbmGenerico";

//  Datos para el filtro de búsqueda — email como identificador principal
const inputsFiltro  : InputsPropsBuscador[] =[
    {
        name: "email",
        label: "Correo electrónico",
        type: "email",
        placeholder: "Ingrese correo electrónico",
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

// Datos para el formulario de alta — email como primer campo obligatorio
const inputsAlumnos : InputsPropsFormulario[] = [
    {
        name: "email",
        label: "Correo Electrónico",
        type: "email",
        placeholder: "ejemplo@correo.com",
        value: "",
        readonly: false,
        columnGroup: 1,
        hint: "Este correo será el usuario de acceso del alumno."
    },
    {
        name: "dni",
        label: "Dni Alumno",
        type: "text",
        placeholder: "Ingrese Dni (opcional)",
        value: "",
        readonly: false,
        columnGroup: 2,
        hint: "Opcional — solo para seguro o certificados. Si no se ingresa, se generará un número aleatorio."
    },
    {
        name: "apellido",
        label: "Apellido",
        type: "text",
        placeholder: "Ingrese Apellido",
        value: "",
        readonly: false,
        columnGroup: 2
    },
    {
        name: "nombre",
        label: "Nombre",
        type: "text",
        placeholder: "Ingrese Nombres",
        value: "",
        readonly: false,
        columnGroup: 1
    },
    {
        name: "celular",
        label: "Celular",
        type: "tel",
        placeholder: "+54 9 11 1234-5678",
        value: "",
        readonly: false,
        columnGroup: 1,
        contactPanel: true
    },
    {
        name: "pin_asistencia",
        type: "text",
        placeholder: "",
        value: "",
        readonly: true,
        columnGroup: 2,
        contactPanel: true,
        hint: "Se generará automáticamente un PIN de 4 dígitos y se enviará al correo del alumno."
    }
];

/** Mapea los datos del listado al formato del formulario para modificar un alumno. */
const mapAlumnoForm =( dataM : any) =>({
    dni: dataM.Dni || "",
    apellido: dataM.Apellido,
    nombre: dataM.Nombre,
    email: dataM.email || dataM.Email || "",
    celular: dataM.Celular || "",
    pin_asistencia: dataM.pin_asistencia || ""
});

/** Mapea los datos de un alumno para darlo de baja, usando el email como identificador. */
const mapAlumnoEliminar =( data : any) =>({
    email: data.email || data.Email || "",
    dni: data.Dni || ""
});

const mapTextoEliminar = (dataE: any) => 
    ` El estado del Alumno "${dataE.Nombre} ${dataE.Apellido}" (Email: ${dataE.email || dataE.Email}) cambiará`;



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
        celular: "",
        pin_asistencia: ""
    },

    estados: ["activos", "inactivos"],

    paginacion : { 
        pagina : 1,
        limite : 6,
        contadorPagina : 0
    },

    inicialFiltros : { 
        email : "", 
        apellido : "" 
    },

    mapDeFormulario : mapAlumnoForm, 
    mapDataEliminar : mapAlumnoEliminar, 
    mapTextoEliminar: mapTextoEliminar 
}

    return useAbmGenerico<AlumnosResponse>(config);
}