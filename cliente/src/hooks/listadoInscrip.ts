import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { fechaHoy, calcularSeisMesesAtras} from "../utils/fecha";
import { peticiones } from "../utils/peticiones";

import { type FiltroBusqueda, type InscripcionListadoResult } from "../tipadosTs/inscripciones"; 
import { type PaginacionProps } from "../tipadosTs/genericos";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface InscripcionConfig{

    servicios : {
        listado : ServicioCrud,
        anulacion : ServicioCrud,
    },

    idEscuela : number  , 
    estados: string[] ; 
    inputsFiltros: any[];
    inicialFiltros : any;
    paginacion :  PaginacionProps
};



export const listaInscripcionLogica = ( config : InscripcionConfig ) => {
 const irA = useNavigate();   

 const [errorGenerico , setErrorGenerico] =  useState< string | null >(null);
// abro la ventana para inscribir al alumno
 const abrirInscribir = () =>{
    irA("/inscrip_page");
 };

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
        estado : "activos",
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
      //  console.log(event.target.name)
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
//  Anular la inscripcion
//
/////////////////////////////////////////////////////////////////////////////// 
  interface dataAnular {
    modalAnular: boolean;
    idInscripcion: number | null;
    metodo_pago : string,
    monto_pagado : string,
    carga: boolean  ;
    texto: string  ;
    mensajeError : string
  }

const [ dataAnularInscripcion , setDataAnularInscripcion ] = useState<dataAnular>({
    modalAnular : false,
    idInscripcion : null,
    metodo_pago : "",
    monto_pagado : "",
    carga : false,
    texto : "",
    mensajeError : ""
});

const [ actualizarListado , setActualizarListado] = useState<number>(0);

const setearDataosAnulacion = () =>{
    setDataAnularInscripcion( prev => ({
        ...prev,
        idInscripcion : null, 
        monto_pagado : "",
        metodo_pago : "",
        modalAnular : false , 
        texto : "",
        mensajeError : "",
        carga : false, 
    }));
};

const manejarSeleccionInscripcion = ( id : number , metodo_pago : string, monto_pagado : string) => {

 //console.log("PASO 1: ¡Llegó al Hook! ID:", id , metodo_pago);
 if (!id) {  
    setearDataosAnulacion();
 }else{
    setDataAnularInscripcion( prev => ({
        ...prev,
        idInscripcion : id , 
        modalAnular : true , 
        metodo_pago : metodo_pago,
        monto_pagado : monto_pagado,
        texto : `Se anulara la inscripcion de : ${id},
                 metodo de pago : ${metodo_pago} `,
        mensajeError : ""
    }));
 };

};

const handleCancelarAnulacion = () =>{
    setearDataosAnulacion();
};

const handleAnularInscripcion = async () =>{
    setDataAnularInscripcion( prev => ({ ...prev , carga : true}));
    try {
       const servicioApiFetch  = config.servicios.anulacion;
       const respuestaAnulacion = await  servicioApiFetch({
            id_escuela : config.idEscuela,
            id_inscripcion : dataAnularInscripcion.idInscripcion as number,
            estadoInsc : "activos",
            metodo_pago : dataAnularInscripcion.metodo_pago,
            monto :  Number(dataAnularInscripcion.monto_pagado),
            descripcion : "Anulación de inscripción", 
       }); 

   
       switch (respuestaAnulacion.code ){
            case "TRANSACCION_EXITOSA_ANULACION_INSCRIPCION" :{
                await new Promise(resolve => setTimeout(resolve, 600));
                setActualizarListado( actualizarListado + 1);
                setearDataosAnulacion();

                return;                    
            };

            case "SIN_PERMISO" : {
                setDataAnularInscripcion( prev => ({
                    ...prev , 
                    mensajeError : respuestaAnulacion.message || "No tienes permiso para anular esta inscripción.",
                }));
                return;
            };

            case "NO_EXISTE_CAJA" : {
                setDataAnularInscripcion( prev => ({
                    ...prev , 
                    mensajeError : respuestaAnulacion.message || "No se encontró una caja abierta para esta escuela, Abra una caja para poder anular la inscripción.",
                }));
                return;           
            };

            case "TRANSACCION_FALLIDA_ANULAR_INCRIPCION" : {
                setDataAnularInscripcion( prev => ({
                    ...prev , 
                    mensajeError : respuestaAnulacion.message || "Error al anular la inscripción, por favor intente nuevamente.",
                }));
                return;           
            };

            case "SIN_CATEGORIA_ANULACION" : {
                setDataAnularInscripcion( prev => ({
                    ...prev , 
                    mensajeError : respuestaAnulacion.message || "Error en el seteo de la categoría de anulación.",
                }));
                return;           
            };

            default : {
                setDataAnularInscripcion( prev => ({...prev , mensajeError : "Ocurrio un error al intentar anular la inscripcion, por favor intente nuevamente."}));
                return;
            };
       };

    }catch ( error) {
       setDataAnularInscripcion( prev => ({ ...prev , mensajeError : "Ocurrió un error inesperado al anular la inscripción."}));
    }finally{
       setDataAnularInscripcion( prev => ({ ...prev , carga : false})); 
    };
};

//////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//
//  LISTADO DE INSCRIPCIONES 
//
///////////////////////////////////////////////////////////////////////////////    

// Estados del listado --------------------------------------------------------
    const [ dataListado , setDataListado] = useState<InscripcionListadoResult[] >( [] );
    const [carga , setCarga] = useState<boolean>(true);
    const [ barraPaginacion , setBarraPaginacion ] = useState<PaginacionProps>(config.paginacion);


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
},[ filtroData, actualizarListado]);



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
        dataListado,
    //-------------------------------------      
        abrirInscribir,
    //-------------------------------------  
        dataAnularInscripcion,
        manejarSeleccionInscripcion,
        handleCancelarAnulacion,
        handleAnularInscripcion,
    };
};