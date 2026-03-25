import { useState, useEffect } from "react";

import { fechaHoy, calcularSeisMesesAtras} from "../utils/fecha";
import { peticiones } from "../utils/peticiones";

import { type FiltroBusqueda, type InscripcionListadoResult } from "../tipadosTs/inscripciones"; 
import { type PaginacionProps } from "../tipadosTs/genericos";
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface InscripcionConfig{

    servicios : {
        listado : ServicioCrud
    },

    idEscuela : number  , 
    estados: string[] ; 
    inputsFiltros: any[];
    inicialFiltros : any;
    paginacion :  PaginacionProps
};



export const listaInscripcionLogica = ( config : InscripcionConfig ) => {

 const [errorGenerico , setErrorGenerico] =  useState< string | null >(null);


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
        pagina : config.paginacion.pagina as number,
        limit : config.paginacion.limite as number,
    });

//--------------------- HANDLES FILTROS PAGINACION ---------------------------------
    const handlePaginaCambiada = (pagina: number) => {
        setFiltroData({
            ...filtroData,
            pagina: pagina
        });
    };
//--------------------- HANDLES FILTROS BUSQUEDA ---------------------------------   
    const handleChangaValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.name)
        setFiltroData( prev  => ({
            ...prev,
            [event.target.name] : event.target.value,
            pagina : 1
        }));
    };
    const handleChangeEstado = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = event.target.value as FiltroBusqueda['estado']; 
        setFiltroData( prev => ({
            ...prev,
            estado : nuevoEstado, pagina : 1
        }));
    };

    const handleChangeFechaDesde = ( event: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroData( prev => ({
            ...prev,
            fecha_desde : event.target.value,
            pagina : 1
        }));           
    };
    const handleChangeFechaHasta = ( event: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroData( prev => ({
            ...prev,
            fecha_hasta : event.target.value,
            pagina : 1
        })); 
    };    

////////////////////////////////////////////////////////////////////////////////
//
//  LISTADO DE INSCRIPCIONES 
//
///////////////////////////////////////////////////////////////////////////////    

// Estados del listado --------------------------------------------------------
    const [ dataListado , setDataListado] = useState<InscripcionListadoResult[] >( [] );
    const [carga , setCarga] = useState<boolean>(true);
    const [ barraPaginacion , setBarraPaginacion ] = useState<PaginacionProps>(config.paginacion);

    console.log(dataListado)

// Listado de isncriopciones --------------------------------------------------
useEffect( () =>{
 
    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico,
        setCarga
    }); 
    
const listadoInscrip = async () => {
    setCarga(true); // Aseguramos carga antes de empezar
    try {
        const servcioListado = config.servicios.listado;    
        const listadoRespuesta = await servcioListado(filtroData, signal);
        
        //  VALIDACIÓN CRÍTICA:
        // Si la respuesta no es lo que esperamos, no seteamos basura
        if (listadoRespuesta && listadoRespuesta.data) {
            setDataListado(listadoRespuesta.data);
            setBarraPaginacion(listadoRespuesta.paginacion);
        } else {
            // Si el back responde pero sin data (ej. 404), limpiamos
            setDataListado([]); 
            setBarraPaginacion( prev => ({
                ...prev,
                pagina : 1
            }));
        }

    } catch (error: any) {
        // Si el error es porque abortamos la petición, no hacemos nada
        if (error.name === 'AbortError') return;

        setErrorGenerico('Ocurrió un error inesperado al cargar el Listado.');
        setDataListado([]); // 👈 LIMPIAMOS EL LISTADO PARA QUE NO HAYA DATOS VIEJOS ROMPIÉNDOSE
    } finally {
        clearTimeout(timeoutId);
        setCarga(false);
    }        
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
        barraPaginacion,
        handleChangaValue,
        handleChangeEstado,
        handleChangeFechaDesde,
        handleChangeFechaHasta,
        handlePaginaCambiada,
    //-------------------------------------    
        dataListado

    };
};