import { useState, useEffect } from "react";

//hooks
import { peticiones } from "./peticiones";
// Typados 
import {type PaginacionProps } from "../tipadosTs/genericos";


/**
 * @typedef {function(data: any, signal?: AbortSignal): Promise<any>} ServicioCrud
 * Define el contrato para las funciones de servicio CRUD (asíncronas).
 */
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

export  interface DataPlan {
    id: number;
    descripcion : string;
    monto: number;
    clases: number;
    meses: number;
};

 export interface DataAlumno {
    Dni : string ,
    Nombre : string , 
    Apellido : string
}



interface InscripcionConfig {
    idEscuela : number,

    servicios :{
        listaAlumnosPaginado : ServicioCrud,
        listaPlanPaginado    : ServicioCrud,

        listadoAlumnosBusqueda : ServicioCrud,

    },
    paginacion : PaginacionProps,

    inicialFiltroAlumno : { dni : string},
    inicialFiltroPlan   : { descripcion : string }
};


export const useInscipcion =( config : InscripcionConfig) =>{

    const [errorGenerico , setErrorGenerico] =  useState< string | null >(null);
    const [carga , setCarga] = useState<boolean>(true);

    const [plan , setPlan] = useState< DataPlan | null >( null );
    const [alumno , setAlumno] = useState< DataAlumno | null>(null);

    const [filtroBusquedaAlumno , setFiltroBusquedaAlumno] = useState<any>({
        ... config.inicialFiltroAlumno ,
        estado : "activos" ,
        id_escuela : config.idEscuela,
        pagina : config.paginacion.pagina,
        limite : config.paginacion.limite        
    });

    const [filtroBusquedaPlan , setFiltroBusquedaPlan] = useState({
        ...config.inicialFiltroPlan,
        estado : "activos",
        id_escuela : config.idEscuela,
        pagina : config.paginacion.pagina,
        limite : config.paginacion.limite 
    });
     
    const [listadoPlan , setListadoPlan] = useState<DataPlan[]>([]);
    const [listadoAlumno , setListadoAlumno] = useState<DataAlumno[]>([]);

    const handleCachearPlan = (e: React.ChangeEvent<HTMLInputElement>) => {

        setFiltroBusquedaPlan({
            ...filtroBusquedaPlan,
            pagina : 1,
            [e.target.name] : e.target.value
        });
        const descripcionPlan = e.target.value;
        const planSeleccionado = listadoPlan.find( planes => planes.descripcion === descripcionPlan );

        if ( planSeleccionado) {
            setPlan(planSeleccionado)
        }else{
            setPlan(null)
        }
    };

    const handleCachearAlumno = (e: React.ChangeEvent<HTMLInputElement>) =>{

        setFiltroBusquedaAlumno({
            ...filtroBusquedaAlumno,
            pagina : 1,
            [e.target.name] : e.target.value
        });
        const dniAlumno = e.target.value;

        const alumnoSeleccionado = listadoAlumno.find( alumno => String(alumno.Dni) === dniAlumno );

        if (alumnoSeleccionado){
            setAlumno(alumnoSeleccionado)
        }else{
            setAlumno(null)
        };
    };

    const handleInscribir = (e : React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        console.log("Subcripcion a inscripcion")
    };

    const handleCancelar = (e : React.MouseEvent<HTMLButtonElement>) =>{
        e.preventDefault();
         console.log("Cancelacion -- cerrar el modal")
   };

// ──────────────────────────────────────────────────────────────
// Listado de alumnos  con paginacion y sin paginacion 
// ──────────────────────────────────────────────────────────────
useEffect(()=>{
        const { signal, timeoutId, controlador} = peticiones({
            tiempo : 5,
            setErrorGenerico,
            setCarga
        });

    const listadoAlumnoPaginacion = async() => {

        const servicioApiFetch = config.servicios.listaAlumnosPaginado;
        const servicioApiFetchSinPag = config.servicios.listaAlumnosPaginado;
            try{
                if (filtroBusquedaAlumno.dni === ""){    
                    const listado = await servicioApiFetch(filtroBusquedaAlumno, signal);
                    if( listado.error === false) {
                        setListadoAlumno(listado.data)
                    };
                }else{
                    const listadoFiltro = await servicioApiFetchSinPag(filtroBusquedaAlumno, signal);
                    if (listadoFiltro.error === false){
                        setListadoAlumno(listadoFiltro.data)
                    }
                }

            }catch( error ){
                // Manejo de errores de conexión/aborto.
                setErrorGenerico('Ocurrió un error inesperado  donde esal cargar los datos Alumnmos.');
            }finally{
                clearTimeout(timeoutId);
                setCarga(false);
            }
        };

        listadoAlumnoPaginacion();    

        return () =>{
            controlador.abort();
            clearTimeout(timeoutId);
        };

},[filtroBusquedaAlumno]);

// ──────────────────────────────────────────────────────────────
// Listado de planes con paginacion y sin paginacion
// ──────────────────────────────────────────────────────────────
useEffect( () =>{
    const { signal, timeoutId, controlador} = peticiones({
        tiempo : 5,
        setErrorGenerico,
        setCarga
    });

    const listadoPlanesPaginado = async () => {
        const servicioApiFetch = config.servicios.listaPlanPaginado;
    
        if ( filtroBusquedaPlan.descripcion === ""){
            try{    
                const listadoP  = await servicioApiFetch( filtroBusquedaPlan , signal);
            // console.log(listadoP)
                if ( listadoP.error === false) {
                    setListadoPlan(listadoP.data)
                }

            }catch( error ){
                // Manejo de errores de conexión/aborto.
                setErrorGenerico('Ocurrió un error inesperado al cargar los datos Planes.');  
            }finally{
                controlador.abort();
                clearInterval(timeoutId);
            };
        }else{
                console.log("listado planes con filtros")
        };
    };

    listadoPlanesPaginado();

    return() => {
        controlador.abort();
        clearTimeout(timeoutId);
    }

},[filtroBusquedaPlan]);


useEffect(()=>{
 //   console.log(filtroBusquedaPlan)
},[filtroBusquedaPlan]);

    return{
        plan,
        alumno,

        listadoPlan,
        listadoAlumno,

        handleCachearPlan,
        handleCachearAlumno,

        handleInscribir,
        handleCancelar
    };    

};