import { useState , useEffect} from "react";

import { peticiones } from "./peticiones";


/**
 * @typedef {function(data: any, signal?: AbortSignal): Promise<any>} ServicioCrud
 * Define el contrato para las funciones de servicio CRUD (asíncronas).
 */
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;
import type * as TipadoHorario from "../tipadosTs/horario";
import { type ClaseHorario  } from "../componentes/ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../componentes/CeldaVacia/CeldaVacia";



interface HorarioConfig {
    idEscuela : number,

    servicios : {
        listadoProfesores : ServicioCrud,
        listadoNivel : ServicioCrud,
        listadoTipo : ServicioCrud,
        HORARIOS  :  TipadoHorario.Horas[], 
        DIAS_SEMANA : TipadoHorario.DiaSemana[],
    },
    inicialFiltroProfesor : { dni : string },
    inicialFiltroNivel : { nivel : string },
    inicialFiltroTipo : { tipo : string },

};


export const useHorarioHook = ( config : HorarioConfig ) =>{
    const [errorGenerico , setErrorGenerico] =  useState< string | null >(null);
    const [carga , setCarga] = useState<boolean>(true);
    const [ modalInterno , setModalInterno ] = useState<boolean>(false);

    const [profesores , setProfesores] = useState<TipadoHorario.DataProfesor | null>(null);
    const [listaProfe , setListaProfe ] = useState<TipadoHorario.DataProfesor[]>([]);
   
    const [niveles , setNiveles ] = useState<TipadoHorario.DataNivel | null>( null);
    const [listaNiveles , setListaNiveles ] = useState<TipadoHorario.DataNivel[]>([]);

    const [tipo , setTipo ] = useState<TipadoHorario.DataTipo | null>( null);
    const [listaTipo , setListaTipo ] = useState<TipadoHorario.DataTipo[]>([]);

    const horarios : TipadoHorario.Horas[] = config.servicios.HORARIOS;
    const diasSemana : TipadoHorario.DiaSemana[] = config.servicios.DIAS_SEMANA;
 


    const [filtroBusquedaProfesor , setFiltroBusquedaProfesor] = useState<TipadoHorario.FiltroProfesor>({
        ...config.inicialFiltroProfesor ,
        estado : "activos" ,
        id_escuela : config.idEscuela
    });
    const [filtroBusquedaNivel , setFiltroBusquedaNivel] = useState<TipadoHorario.FiltroNivel>({
        ...config.inicialFiltroNivel,
        estado : "activos",
        id_escuela : config.idEscuela,
    });
    const [ filtroBusquedaTipo , setFiltroBusquedaTipo ] = useState<TipadoHorario.FiltroTipo>({
        ...config.inicialFiltroTipo,
        estado : "activos",
        id_escuela : config.idEscuela,
    });

    const [dataForm , setDataForm] = useState<TipadoHorario.DataHorario | null>( null )

    const handleCachearProfesores = ( e: React.ChangeEvent<HTMLInputElement> ) =>{

       setFiltroBusquedaProfesor({
            ...filtroBusquedaProfesor,
            [ e.target.name ] : e.target.value
       });
       const dniProfesor = e.target.value;
       const profeSeleccionado = listaProfe.find( profe => profe.Dni === dniProfesor);
       if( profeSeleccionado ){
            setProfesores( profeSeleccionado );
       } else {
            setProfesores( null );
       }
    };

    const handleCachearNiveles = ( e: React.ChangeEvent<HTMLInputElement> ) =>{
        setFiltroBusquedaNivel({
             ...filtroBusquedaNivel,
             [ e.target.name ] : e.target.value 
        });
        const nivelSeleccionado = listaNiveles.find( nivel => nivel.nivel === e.target.value);
      
        if( nivelSeleccionado ){
             setNiveles( nivelSeleccionado );
        } else {
             setNiveles( null );
        };
    };
    
   const handleCachearTipos = (e :  React.ChangeEvent<HTMLInputElement> ) =>{
        setFiltroBusquedaTipo({
            ...filtroBusquedaTipo,
            [ e.target.name ] : e.target.value  
         });
         
         const tipoSeleccionado = listaTipo.find( tipo => tipo.tipo === e.target.value);   
         if( tipoSeleccionado ){
              setTipo( tipoSeleccionado );
         } else {
              setTipo( null );
         };      
   };

   const handleModHorariosData = ( clase : ClaseHorario ) =>{
        console.log(clase)
    // obtengo la info cn un useState (dataForm) de alta horario y abro el modal (modalInterno) con el formulario de ala
   };

   const hanldeAltaHorariosData = ( mensaje : MensajeCelda) =>{
        console.log( mensaje )
   };

// ──────────────────────────────────────────────────────────────
// Listado de profesores sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{
    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico,
        setCarga
    });

    const listadoProfesoreCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoProfesores;
        try {
            const respuesta = await servicioApiFetch( filtroBusquedaProfesor , signal );
    
            if ( respuesta.error === false ) {
                setListaProfe( respuesta.data );
            };
        }catch(error) {
            setErrorGenerico('Ocurrió un error inesperado al cargar los datos Profesores.');  
        }finally{
            clearTimeout( timeoutId );
            setCarga( false );
        };

    };

    listadoProfesoreCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [filtroBusquedaProfesor] );

// ──────────────────────────────────────────────────────────────
// Listado de niveles sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{

    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico,
        setCarga
    });

    const listadoNivelCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoNivel;
        try {
            const respuesta = await servicioApiFetch( filtroBusquedaNivel , signal );

            if ( respuesta.error === false ) {
                setListaNiveles( respuesta.data );
            };
        }catch(error) {
            setErrorGenerico('Ocurrió un error inesperado al cargar los datos Profesores.');  
        }finally{
            clearTimeout( timeoutId );
            setCarga( false );
        };

    };

    listadoNivelCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [filtroBusquedaNivel] );

// ──────────────────────────────────────────────────────────────
// Listado de Tipos sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{

    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico,
        setCarga
    });

    const listadoTiposCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoTipo;
        try {
            const respuesta = await servicioApiFetch( filtroBusquedaTipo , signal );
            console.log( respuesta );
            if ( respuesta.error === false ) {
                setListaTipo( respuesta.data );
            };
        }catch(error) {
            setErrorGenerico('Ocurrió un error inesperado al cargar los datos Profesores.');  
        }finally{
            clearTimeout( timeoutId );
            setCarga( false );
        };

    };

    listadoTiposCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [filtroBusquedaTipo] );

return {
    profesores,
    niveles,
    tipo,

    listaProfe,
    listaNiveles,
    listaTipo,
    
    horarios, diasSemana,


    handleCachearProfesores,
    handleCachearNiveles,
    handleCachearTipos,

    handleModHorariosData,
    hanldeAltaHorariosData,

    modalInterno,
};

};