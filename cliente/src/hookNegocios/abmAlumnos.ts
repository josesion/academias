import { useState, useContext, useEffect } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";
import type { AlumnosResponse } from "../tipadosTs/alumnos";
import type { PaginacionProps } from "../tipadosTs/genericos";
import type { ErrorBackend } from "../hooks/erroresZod";

//Seccion de servicios--------------------------------------
import { registroAlumno , listadoAlumnos, modAlumno } from "../servicio/alumnos.fetch";

//Seccion de hooks------------------------------------------
import { transformErrores } from "../hooks/erroresZod";
import { peticiones } from "../hooks/peticiones";


// Inicio del hook para logia abm alumnos
export const useAbmAlumnos = () =>{ 
// contexto
const { rol } = useContext( RutasProtegidasContext );
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


//Arrego para determinar los estados del alumno
const estados = ["activos" , "inactivos"];

// useStates--------------------------------------------
    const [ modal , setModal]  = useState<boolean>(false);
    const [ modalEliminar , setModalEliminar] = useState<boolean>(true);
    const [ tipoFormulario , setTipoFormulario] = useState<"alta" | "modificar">("alta");
    const [ errorsZod, setErrorsZod] = useState<Record<string, string | null>>({ }); 
    const [ errorGenerico, setErrorGenerico] = useState<string | null>(null);
    const [ carga , setCarga] = useState<boolean>(true);
    const [ estadoListado , setEstadoListado] = useState({ error : false , statuscode : 0});
    const [ actualizarListado , setActualizarListado] = useState<number>(0);
    // formData es la info q se captura para pasar al bakend
    const [ formData, setFormData] = useState<any>({
        dni: '',
        apellido: '',
        nombre: '',
        celular: "",
        id_escuela : rol?.escuela
        });
    // dataAlumnosListado es para el listado de alumnos    
    const [ dataAlumnosListado , setDataAlumnosListado ] = useState<AlumnosResponse[]>([]);
    // barraPaginacion es para los datos de la paginacion
    const [ barraPaginacion , setBarraPaginacion ] = useState<PaginacionProps>({
        pagina : 1,
        limite : 6,
        contadorPagina : 0
    });  
    // filtroData es para los datos del filtro de busqueda
    const [filtroData , setFiltroData] =  useState<any>({
        dni : "", 
        apellido : "" , 
        nombre : "",
        estado : "activos",
        id_escuela : rol?.escuela || 1,
        pagina : barraPaginacion.pagina,
        limite : barraPaginacion.limite
    });

// Manejadires de eventos------------------------------

    const handleChangeBuscador = (e: React.ChangeEvent<HTMLInputElement>) =>{
        setFiltroData({
            ...filtroData,
            pagina: 1,
            [e.target.name] : e.target.value,
        })
    };

    const handleChangeFormulario = (e: React.ChangeEvent<HTMLInputElement>) => { 
        setFormData({
            ...formData,
            [e.target.name] : e.target.value,
        })

    };

    const handleEstado = (e: React.ChangeEvent<HTMLSelectElement>) =>{
            setFiltroData({
                ...filtroData,
                pagina: 1,
                estado : e.target.value
            });
    };

    const handleSubmit   = async(e : React.FormEvent<HTMLFormElement>) =>{ 
        e.preventDefault();

        const resultado = await registroAlumno( formData );
        if ( resultado.error === true && resultado.code === "VALIDATION_ERROR" && resultado.errorsDetails) {
            const erroresTransformados = transformErrores( resultado.errorsDetails  as ErrorBackend[]);
            setErrorsZod(erroresTransformados);
            setErrorGenerico(resultado.message);
            return ;
        }

        if ( resultado.error === true) {
            setErrorGenerico(resultado.message);
            setErrorsZod({null : null });
            return;
        }
        setActualizarListado( actualizarListado + 1 );
        setFormData({
            dni: '',
            apellido: '',
            nombre: '',
            celular: "",
            id_escuela : rol?.escuela
        });

        return setModal(false)
    }; 
    
    const handleSubmitModificar   = async(e : React.FormEvent<HTMLFormElement>) =>{ 
        e.preventDefault();
        //console.log("Modificar", formData);
        const resultado = await modAlumno( formData) ;
        if ( resultado.error === true && resultado.code === "VALIDATION_ERROR" && resultado.errorsDetails ) {
            const erroresTransformados = transformErrores( resultado.errorsDetails  as ErrorBackend[]);
            setErrorsZod(erroresTransformados);
            setErrorGenerico( resultado.message);
            return;
        }
        
        if ( resultado.error === true) {
            setErrorGenerico(resultado.message);
            setErrorsZod({null : null });
            return;
        }
        setActualizarListado( actualizarListado + 1 );
        setFormData({
            dni: '',
            apellido: '',
            nombre: '',
            celular: "",
            id_escuela : rol?.escuela
        });

        return setModal(false)
    }   

    const handlePaginaCambiada = (pagina: number) => {
        setFiltroData({
            ...filtroData,
            pagina: pagina
        });
    };

    const handleCancelar = () =>{ 
        setModal(false) ;
        setTipoFormulario("alta");
        setErrorsZod({});
        setErrorGenerico(null);
    };

    const handleAgragar = ( ) =>{
        setFormData({            
            dni: '',
            apellido: '',
            nombre: '',
            celular: "",
            id_escuela : rol?.escuela
        });
        setModal( true );
        setTipoFormulario("alta");

    };

    const handleModificar = ( dataM : any ) =>{
        //console.log("Modificar", dataM);
        setFormData({
            dni: dataM.Dni,
            apellido: dataM.Apellido,
            nombre: dataM.Nombre,
            celular: dataM.Celular,
            id_escuela: rol?.escuela || 1
        })

        setTipoFormulario("modificar");
        setModal( true );
        
    };

    const handleEliminar = ( dataE : any ) =>{
        console.log("Eliminar", dataE);
    }

// Efects-----------------------------------------------
    useEffect(() => {
    // 1. Configura el controlador de aborto y la lógica del temporizador.
    const { signal, timeoutId, controlador } = peticiones({
        tiempo: 5,
        setErrorGenerico,
        setCarga
    });

    const listado = async () => {
        try {
            setCarga(true);
        
            const listado_alumnos = await listadoAlumnos(filtroData, signal);
            console.log( listado_alumnos);
            //NOT_AUTHENTICATED y error true
            // crear un modal q diga q no esta autorizado y mande al login 
            if (!listado_alumnos.error && listado_alumnos.data && listado_alumnos.paginacion) {
                setDataAlumnosListado(listado_alumnos.data);
                setBarraPaginacion(listado_alumnos.paginacion);
                setEstadoListado({ error: listado_alumnos.error, statuscode: listado_alumnos.statusCode })
            }else{  
                setEstadoListado({ error: listado_alumnos.error, statuscode: listado_alumnos.statusCode }); 
                setDataAlumnosListado([]); // Limpia la lista
                setBarraPaginacion({ ...barraPaginacion, contadorPagina: 1 }); // Resetea la paginación     
            }
        } catch (error) {
            //console.error('Error inesperado:', error);
            setErrorGenerico('Ocurrió un error inesperado al cargar los datos.');
        } finally {

            clearTimeout(timeoutId);
            setCarga(false);
        }
    };
    

    listado();
    return () => {
        controlador.abort(); 
        clearTimeout(timeoutId);
    };

}, [filtroData, actualizarListado ]);

    return{
        inputsFiltro, inputsAlumnos,estados,
        modal, modalEliminar ,errorsZod, errorGenerico, dataAlumnosListado, 
        formData, barraPaginacion,carga ,estadoListado ,filtroData ,
        tipoFormulario,

        handleChangeBuscador, handleCancelar,
        handleSubmit, handleSubmitModificar, handleChangeFormulario,
        handleAgragar, handleEstado,
        handlePaginaCambiada,
        handleModificar, handleEliminar
    }

}