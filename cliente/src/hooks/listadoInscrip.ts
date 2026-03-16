import { useState, useEffect } from "react";

import { fechaHoy, calcularSeisMesesAtras} from "../utils/fecha";
import { peticiones } from "../utils/peticiones";

import { type FiltroBusqueda, type InscripcionListadoResult } from "../tipadosTs/inscripciones"; 
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface InscripcionConfig{

    servicios : {
        listado : ServicioCrud
    },

    idEscuela : number  , 
    estados: string[] ; 
    inputsFiltros: any[];
    inicialFiltros : any;
};



export const listaInscripcionLogica = ( config : InscripcionConfig ) => {

const [errorGenerico , setErrorGenerico] =  useState< string | null >(null)


////////////////////////////////////////////////////////////////////////////////
//
//  SECCION PARA LOS FILTROS DE BUSQUEDA 
//
///////////////////////////////////////////////////////////////////////////////

//--------------------- ESTATOS FILTROS BUSQUEDA -------------------------------

    const [filtroData, setFiltroData] = useState<FiltroBusqueda>({
        id_escuela: config.idEscuela || 0,
        nombre_alumno: config.inicialFiltros?.nombre_alumno || '',
        dni_alumno: config.inicialFiltros?.dni_alumno || '',
        fecha_desde : calcularSeisMesesAtras(fechaHoy()), 
        fecha_hasta : fechaHoy(),
        estado : "todos",
        pagina : 1,
        limit : 10,
    });
    console.log(filtroData)

//--------------------- HANDLES FILTROS BUSQUEDA ---------------------------------   
    const handleChangaValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroData( prev  => ({
            ...prev,
            [event.target.name] : event.target.value,
        }));
    };
    const handleChangeEstado = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = event.target.value as FiltroBusqueda['estado']; 
        setFiltroData( prev => ({
            ...prev,
            estado : nuevoEstado
        }));
    };

    const handleChangeFechaDesde = ( event: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroData( prev => ({
            ...prev,
            fecha_desde : event.target.value
        }));           
    };
    const handleChangeFechaHasta = ( event: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroData( prev => ({
            ...prev,
            fecha_hasta : event.target.value
        })); 
    };    

////////////////////////////////////////////////////////////////////////////////
//
//  LISTADO DE INSCRIPCIONES 
//
///////////////////////////////////////////////////////////////////////////////    

// Estados del listado --------------------------------------------------------
    const [ dataListado , setDataListado] = useState<InscripcionListadoResult[] | null >( null );
    const [carga , setCarga] = useState<boolean>(true);
    console.log(dataListado)
// Listado de isncriopciones --------------------------------------------------
useEffect( () =>{
 
    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico,
        setCarga
    }); 
    
    const  listadoInscrip = async () => {

        try {
            const servcioListado =  config.servicios.listado;    
            const listadoRespuesta = await servcioListado( filtroData , signal);
            console.log(listadoRespuesta)    
            setDataListado(listadoRespuesta.data)
        }catch(error) {
            setErrorGenerico('Ocurrió un error inesperado al cargar el Listado de incripcion .');  
        }finally{
            clearTimeout( timeoutId );
            setCarga( false );
        };        
    };

    listadoInscrip();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };    
},[ filtroData ]);



    return{
        carga,

    //--- EXPORT DE FILTROS DE BUSQUEDA ----   
        inputsFiltro: config.inputsFiltros,
        estado : config.estados,
        filtroData,
        handleChangaValue,
        handleChangeEstado,
        handleChangeFechaDesde,
        handleChangeFechaHasta
    //-------------------------------------    
    };
};