import { useState, useEffect } from "react";

//hooks
import { peticiones } from "./peticiones";
import { fechaHoy, fechaVencimiento } from "../utils/fecha";
// Typados 
import {type PaginacionProps } from "../tipadosTs/genericos";
import type * as TipadoInscripcion from "../tipadosTs/inscripciones";
import type { DataCajaDetalleIDs, MetodoPago } from "../tipadosTs/caja.typado";


/**
 * @typedef {function(data: any, signal?: AbortSignal): Promise<any>} ServicioCrud
 * Define el contrato para las funciones de servicio CRUD (asíncronas).
 */
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;





interface InscripcionConfig {
    idEscuela : number,

    servicios :{
        listaAlumnosPaginado : ServicioCrud,
        listaPlanPaginado    : ServicioCrud,

        listadoAlumnosBusqueda : ServicioCrud,
        listadoPlanesBusqueda  : ServicioCrud,
        
        metodoInscripcion   : ServicioCrud,
        registroMovimiento  : ServicioCrud,

        inscripcionCategoriaCaja : ServicioCrud,  
        obtenerIdCaja :  ServicioCrud
    },
    paginacion : PaginacionProps,

    inicialFiltroAlumno : { dni : string},
    inicialFiltroPlan   : { descripcion : string }
};


export const useInscipcion =( config : InscripcionConfig) =>{

    const [errorGenerico , setErrorGenerico] =  useState< string | null >(null);
    const [ modalInsc , setModalInsc] = useState<boolean>(false);
    const [ actualizarListado , setActualizarListado ] = useState<boolean>( false );
    const [actualizarIngresoInscipcion , setActualizarIngresoIncripcion] = useState<boolean>( false );

    const [carga , setCarga] = useState<boolean>(true);
    const [enviando, setEnviando] = useState<boolean>(false);

    const [plan , setPlan] = useState< TipadoInscripcion.DataPlan | null >( null );
    const [alumno , setAlumno] = useState< TipadoInscripcion.DataAlumno | null>(null);
    const [notas ,setNotas] = useState<string>("");
    const [ metodoPago , setMetodoPago ] = useState<MetodoPago | null >(null);

    const [ detalleMovimientoIds, setDetalleMovimientoIds ] = useState<DataCajaDetalleIDs>({
        id_caja : null,
        id_categoria : null
    });
    console.log(detalleMovimientoIds)
    const [filtroBusquedaAlumno , setFiltroBusquedaAlumno] = useState<TipadoInscripcion.FiltroAlumno>({
        ... config.inicialFiltroAlumno ,
        estado : "activos" ,
        id_escuela : config.idEscuela,
        pagina : config.paginacion.pagina,
        limite : config.paginacion.limite        
    });

    const [filtroBusquedaPlan , setFiltroBusquedaPlan] = useState<TipadoInscripcion.FiltroPlan>({
        ...config.inicialFiltroPlan,
        estado : "activos",
        id_escuela : config.idEscuela,
        pagina : config.paginacion.pagina,
        limite : config.paginacion.limite 
    });

    const [listadoPlan , setListadoPlan] = useState<TipadoInscripcion.DataPlan[]>([]);
    const [listadoAlumno , setListadoAlumno] = useState<TipadoInscripcion.DataAlumno[]>([]);


    const handleCachearPlan = (e: React.ChangeEvent<HTMLInputElement>) => {

        setFiltroBusquedaPlan({
            ...filtroBusquedaPlan,
            pagina : 1,
            [e.target.name] : e.target.value
        });
        const descripcionPlan = e.target.value;
        const planSeleccionado = listadoPlan.find( planes => planes.descripcion === descripcionPlan );
      //  console.log(listadoPlan)
        if ( planSeleccionado) {
            setPlan(planSeleccionado)
        }else{
            setPlan(null);
            setErrorGenerico(null);
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
            setAlumno(null);
            setErrorGenerico(null);
        };
    };

    const handleCachearMetodoPago = (e: React.ChangeEvent<HTMLInputElement>) =>{
        console.log( e.target.value)
        if (   e.target.value === "efectivo"
            || e.target.value === "transferencia"
            || e.target.value === "credito"
            || e.target.value === "debito" 
        ){
            console.log("paso")
            const metodo = e.target.value as MetodoPago;
            setMetodoPago(metodo)
        }else{
            console.log("no paso")
            setMetodoPago(null)
        };
    };

    const handleTextAreaNotas = (e: React.ChangeEvent<HTMLTextAreaElement>) =>{    
        setNotas(e.target.value);
    };
// ──────────────────────────────────────────────────────────────
//Reseteo de los estados 
// ────────────────────────────────────────────────────────────── 
    const resetFormulario = () => {
        // 1. Limpiamos los filtros para que los inputs se vacíen
        setFiltroBusquedaAlumno({
            ...config.inicialFiltroAlumno,
            estado: "activos",
            id_escuela: config.idEscuela,
            pagina: config.paginacion.pagina,
            limite: config.paginacion.limite        
        });

        setFiltroBusquedaPlan({
            ...config.inicialFiltroPlan,
            estado: "activos",
            id_escuela: config.idEscuela,
            pagina: config.paginacion.pagina,
            limite: config.paginacion.limite 
        });

        // 2. Limpiamos las selecciones actuales
        setPlan(null);
        setAlumno(null);
        setNotas("");
        setMetodoPago(null)
        setErrorGenerico(null);

    };


const handleInscribir = async (e : React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();

    
        if (alumno === null || plan === null || metodoPago === null || detalleMovimientoIds.id_caja === null) {
            // Validación de infraestructura (Caja)
            if (detalleMovimientoIds.id_caja === null) { 
                setErrorGenerico("Abra caja antes de realizar una inscripcion"); 
                return; 
            }

            //Caso extremo: Falta todo
            if (plan === null && alumno === null && metodoPago === null) { 
                setErrorGenerico("Seleccionar Plan, Alumno y Metodo de Pago"); 
                return; 
            }

            //Casos individuales
            if (alumno === null) { setErrorGenerico("Seleccionar alumno"); return; }
            if (plan === null) { setErrorGenerico("Seleccionar Plan"); return; }
            if (metodoPago === null) { setErrorGenerico("Seleccione el metodo de pago"); return; }
            
            return; // Seguridad extra
        }
        setEnviando(true);

        try{
                // se realiza el servicio de incripcion 
                const servicioApiFetch = config.servicios.metodoInscripcion;
                const datos = {
                    id_escuela : config.idEscuela,
                    id_plan    : plan.id,
                    dni_alumno : Number(alumno.Dni),
                    fecha_inicio :fechaHoy(),
                    fecha_fin    : fechaVencimiento(plan.meses),
                    monto  : plan.monto,
                    meses_asignados_inscritos : plan.meses,
                    clases_asignadas_inscritas : plan.clases
                };
                
                const subcripcionInsc = await servicioApiFetch( datos );
                
                if ( subcripcionInsc.code === "INSCRIPCION_EXITOSA" ){
                    // al ser exitosa obtengo el id de la inscripcion para agregarla al detalle de caja 
                    const servicioApiFetchDetalleCaja = config.servicios.registroMovimiento;
                    const detalleMovimientoResult = await servicioApiFetchDetalleCaja({
                        id_caja : detalleMovimientoIds.id_caja,
                        id_categoria : detalleMovimientoIds.id_categoria,
                        monto : Number(plan.monto),
                        metodo_pago : metodoPago,
                        descripcion : notas,
                        referencia_id : subcripcionInsc.data.id // este id
                    });
                    console.log(detalleMovimientoResult)
                    if ( detalleMovimientoResult.code === "DETALLE_CAJA_OK"){
                        resetFormulario();
                        setModalInsc(false);     
                        setActualizarIngresoIncripcion(!actualizarIngresoInscipcion);        
                    }else{
                            setErrorGenerico(detalleMovimientoResult.message)
                    }
                    return
                }else{
                    // console.log("mostrar el error al cliente")
                    setErrorGenerico( subcripcionInsc.message  );
                }
        }catch(error){
            setErrorGenerico("Error de conexión");
        }finally{
            setEnviando(false);
        };

        // se realiza el servicio de incripcion 
        const servicioApiFetch = config.servicios.metodoInscripcion;
        const datos = {
            id_escuela : config.idEscuela,
            id_plan    : plan.id,
            dni_alumno : Number(alumno.Dni),
            fecha_inicio :fechaHoy(),
            fecha_fin    : fechaVencimiento(plan.meses),
            monto  : plan.monto,
            meses_asignados_inscritos : plan.meses,
            clases_asignadas_inscritas : plan.clases
        };
        
        const subcripcionInsc = await servicioApiFetch( datos );
        
        if ( subcripcionInsc.code === "INSCRIPCION_EXITOSA" ){
            // al ser exitosa obtengo el id de la inscripcion para agregarla al detalle de caja 
            const servicioApiFetchDetalleCaja = config.servicios.registroMovimiento;
            const detalleMovimientoResult = await servicioApiFetchDetalleCaja({
                id_caja : detalleMovimientoIds.id_caja,
                id_categoria : detalleMovimientoIds.id_categoria,
                monto : Number(plan.monto),
                metodo_pago : metodoPago,
                descripcion : notas,
                referencia_id : subcripcionInsc.data.id // este id
            });
 
            if ( detalleMovimientoResult.code === "DETALLE_CAJA_OK"){
               resetFormulario();
               setModalInsc(false);             
            };
            return
        }else{
           // console.log("mostrar el error al cliente")
            setErrorGenerico( subcripcionInsc.message  );
        }

      
};

    const handleCancelar = (e : React.MouseEvent<HTMLButtonElement>) =>{
        e.preventDefault();
        setErrorGenerico(null)
        setModalInsc(false) 
        resetFormulario();
};

// ──────────────────────────────────────────────────────────────
// Obtencion del id de Inscripcion predeterminado
// ──────────────────────────────────────────────────────────────

useEffect( () => {
    const obtenerIdInscipcion = async () => {
        const servicioApiFetch = config.servicios.inscripcionCategoriaCaja;
        const idCategoriaInscripcion = await servicioApiFetch( config.idEscuela );   
           
        if ( idCategoriaInscripcion.code === "CATEGORIA_INSCRIPCION_OK" && idCategoriaInscripcion.data){

            setDetalleMovimientoIds(prev => ({
                ...prev,          
                id_categoria :  idCategoriaInscripcion.data.id_categoria
            }));     
        }else{
            setDetalleMovimientoIds(prev => ({
                ...prev,          
                id_categoria : null
            })); 
        }
    };
    obtenerIdInscipcion();
}, [] );

// ──────────────────────────────────────────────────────────────
// Obtencion del id_caja si es q se eencuentra abierta
// ──────────────────────────────────────────────────────────────

useEffect( () => {
    const obtenerIdCaja = async () =>{
        const servicioApiFetch = config.servicios.obtenerIdCaja;
        const idCajaAbierta = await servicioApiFetch(config.idEscuela);
        console.log(idCajaAbierta)
        if ( idCajaAbierta.code === "ID_CAJA_OK" && idCajaAbierta.data){
            setDetalleMovimientoIds(prev => ({
                ...prev,          
                id_caja: idCajaAbierta.data.id_caja
            }));
        }else{
            setDetalleMovimientoIds(prev => ({
                ...prev,          
                id_caja : null
            }));           
        };
    }; 
    obtenerIdCaja();
}, []);


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
        const servicioApiFetchSinPag = config.servicios.listadoAlumnosBusqueda;
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

},[filtroBusquedaAlumno, actualizarListado]);

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
        const servicioApiFetchSinPag = config.servicios.listadoPlanesBusqueda;
        
            try{    

                if ( filtroBusquedaPlan.descripcion === ""){
                    const listadoP  = await servicioApiFetch( filtroBusquedaPlan , signal);

                    if ( listadoP.error === false) {
                        setListadoPlan(listadoP.data)
                    };
                }else{
                    const listadoFiltrado = await servicioApiFetchSinPag( filtroBusquedaPlan , signal);
                   
                    if ( listadoFiltrado.error === false) {
                        setListadoPlan(listadoFiltrado.data) 
                    }; 
                };

            }catch( error ){
                // Manejo de errores de conexión/aborto.
                setErrorGenerico('Ocurrió un error inesperado al cargar los datos Planes.');  
            }finally{
                clearTimeout(timeoutId);
                setCarga(false);
            };

    };

    listadoPlanesPaginado();

    return() => {
        controlador.abort();
        clearTimeout(timeoutId);
    }

},[filtroBusquedaPlan, actualizarListado]);




    return{
        plan,
        alumno,
        notas,
        errorGenerico,
        enviando,
        modalInsc,
        setModalInsc,

        listadoPlan,
        listadoAlumno,

        handleCachearPlan,
        handleCachearAlumno,
        handleCachearMetodoPago,
        handleTextAreaNotas,

        handleInscribir,
        handleCancelar,
        actualizarIngresoInscipcion
    };    

};