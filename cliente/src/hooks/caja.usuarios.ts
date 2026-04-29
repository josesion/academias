import { useState , useEffect , useCallback, useRef} from "react";
import { useIncripcionesUsuarios } from "../hookNegocios/Inscripciones";
// utils -------------------------------------------------------------
import { idCajaFuntion } from "../utils/idCaja";

//Seccion de Tipados--------------------------------------
import  { type DataCaja , type  DetalleApertura, type DataAperturaCaja,
          type EstadoCaja, type DetalleCajaMovimientoResult , type scrollStateData,
          type Categoria,  type  RegistroDetalleCaja, type metricasTipoCuentas,
          type ListadoTipoCuentas, type MetricasCajaPanelPrincipal,
        
        } from "../tipadosTs/caja.typado"

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;



interface DataCajaUsuariosConfig {
    id_escuela : number, 
    id_usuario : number,
    
    servicios : {
         metricasPanelCaja : ServicioCrud,
         obtenerIdCaja     : ServicioCrud,
         abrirCaja : ServicioCrud,
         cerrarCaja : ServicioCrud,
         movimientoCajaDetalle : ServicioCrud,
         listadoCategoriaCaja : ServicioCrud,
         registrarMovimientoCaja : ServicioCrud,
         listadoTipoCuentas : ServicioCrud,
         metricasPanelPrincipal :ServicioCrud
    }
};

export const  useCajaUsuario = ( config : DataCajaUsuariosConfig ) =>{

    const { actualizarIngresoInscipcion } = useIncripcionesUsuarios();//  para actrualizar los parametros por la inscripcion


  //------------------  estados para manejar la logica de caja  ------------------  .
    const [modalApertura , setModalApertura] = useState<boolean>(false);
    const [modalCierre , setModalCierre] = useState<boolean>(false);
    const [dataCaja, setDataCaja] = useState<DataCaja>({id_caja : null , id_escuela : config.id_escuela});
    const [apertura ,setApertura] = useState<DataAperturaCaja>({
        id_escuela : config.id_escuela , estado : "abierta", id_usuario_apertura : config.id_usuario 
    });
    const [aperturaDetalle, setAperturaDetalle] = useState<DetalleApertura[]>([]);

   //------------------  metricas de caja  ------------------  .
    const [disparadorRefresco , setDisparadorRefresco] = useState<number>(0);
    const [ panelPrincial , setPanelPrincial ] = useState<MetricasCajaPanelPrincipal[] | null >( null );


    const [errorGenerico, setErrorGenerico] = useState< string | null >(null);
    const [enviando , setEnviando] = useState<boolean>(false);
    const [estadoCaja, setEstadoCaja] = useState<EstadoCaja>("cerrada");


    //------------------  Estados detalle de caja ------------------
    const observer = useRef<IntersectionObserver | null>(null);
    const [movimientos, setMovimientos] = useState<DetalleCajaMovimientoResult[]>([]);
    const [scrollState, setScrollState] = useState<scrollStateData>({
        loading: false,
        hasMore: true,
        offset: 0,
        limite: 5
    });

    //------------------- Estados Ingresos e Egresos ---------------------


    const [modalEgresoIngreso , setModalEgresoIngreso] = useState<boolean>(false);
    const [verificadorSelector , setVerificadorSelector]= useState<boolean>(false); 
    const [verificadorSelectorTipo , setVerificadorSelectorTipo]= useState<boolean>(false);


    const [movimientoExtraordinario, setMovimientoExtraordinario] = useState<RegistroDetalleCaja>({
        id_caja: dataCaja.id_caja ,
        id_categoria: null, // Aquí cae el ID del selector (ej: ID de 'Luz')
        id_cuenta : null,
        id_usuario : config.id_usuario,
        monto: "",
        descripcion: "",// Aquí podés poner "Pago de boleta Edesa"
        referencia_id : 0 ,// es cerro por defecto ya q no es una inscripcion     
        id_escuela : config.id_escuela,
        tipo :""
    });
    const [listadoExtraordinario , setListadoExtraordionario] = useState<Categoria[] | null>( null);

   //------------------- Estados Tipo Cuentas ---------------------
   const [listadoCuentasActivas, setListadoCuentasActivas] = useState<ListadoTipoCuentas[]>([]);

   // --filtroCuentasEstatica -- queda fijo por q solo en caja se muestran las cuentas activas de esa escuela 
   const filtroCuentasEstatica = {
        id_escuela : config.id_escuela,
        estado : "activos"
   }; 

  //------------------- Estado para el panel de metricas de cuentas ---------------------

  const [ metricasTipoCuentas, setMetricasTipoCuentas] = useState<metricasTipoCuentas[]  | null>([]);


// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//                    SECCION PARA LOS HANDLES  DE INGRESOS O EGRESOS DE CAJA 
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────     

// ──────────────────────────────────────────────────────────────
//Hanldes para manejar los estados de de INGRESOS EGRESOS
// ────────────────────────────────────────────────────────────── 
 
const handleMovimientoExtraordinarioChange = (e: React.ChangeEvent< HTMLSelectElement>) => {

    if (e.target.value ){
        setMovimientoExtraordinario( prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setVerificadorSelector(true);
    }else{
        setVerificadorSelector(false);
    };
};

    // --- Cerramos el modal y seteamos a 0 los estados
const handleCerrarModalEgrIng = () =>{

    setListadoExtraordionario( null );
    setMovimientoExtraordinario({
        id_caja: dataCaja.id_caja ,
        id_categoria: null, // Aquí cae el ID del selector (ej: ID de 'Luz')
        monto: "",
        id_cuenta : null,
        id_usuario : config.id_usuario,
        descripcion: "",// Aquí podés poner "Pago de boleta Edesa"
        referencia_id : 0 ,
        id_escuela : config.id_escuela,
        tipo : ""
    });
    setModalEgresoIngreso(false);
    setErrorGenerico(null)
};


   // --- capturamos el id del tipo de cuenta
const handleTipoPagoChange = (e: React.ChangeEvent< HTMLSelectElement>) => {
 
    if (e.target.value) {
        setMovimientoExtraordinario( prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setVerificadorSelectorTipo(true);
    }else {
        setVerificadorSelectorTipo(false);
    };
};

  // --- capturamos el monto para tipo de cuentas
const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    if (value){
        setMovimientoExtraordinario( prev => ({
            ...prev,
            [name]: value
        }));        
    }else{
        setMovimientoExtraordinario( prev => ({
            ...prev,
            monto :""
        }));  
       
    };
};

   // --- capturamos  la descroipcion si es q se le coloca algo en ella     
const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
   const { value, name } = e.target;
    if (value === "" ){
        setMovimientoExtraordinario( prev => ({
            ...prev,
            [name]: ""
        }));        
    }else{
        setMovimientoExtraordinario( prev => ({
            ...prev,
            [name]: value
        }));        
    };

};

    // --- Registramos el movimiento INGRESO/EGRESO 
const handRegistarMovimientoExtraordinario = async () => {

    if (dataCaja.id_caja === null){
         return  setErrorGenerico("Caja esta cerrada")
    }; 
    if ( !verificadorSelector  || movimientoExtraordinario.monto === "" || !verificadorSelectorTipo   ) {
        setErrorGenerico("Verificar los campos del formulario")
    }else{

        const data = {
            id_caja       : dataCaja.id_caja,
            id_escuela    : Number(config.id_escuela), 
            id_categoria  : Number(movimientoExtraordinario.id_categoria),
            monto         : Number(movimientoExtraordinario.monto),
            id_cuenta     : Number(movimientoExtraordinario.id_cuenta),
            id_usuario    : Number(movimientoExtraordinario.id_usuario),
            descripcion   : movimientoExtraordinario.descripcion,
            referencia_id : 0       
        };


        const servicioApiFetch =config.servicios.registrarMovimientoCaja;
        const registroMovimientoResult = await servicioApiFetch(data); 


        if (registroMovimientoResult.code === "DETALLE_CAJA_OK") {
            setDisparadorRefresco( disparadorRefresco + 1);
            setErrorGenerico(null);

            setMovimientos([]);
            setScrollState({
                loading: false,
                hasMore: true,
                offset: 0,
                limite: 5
            });
            await cargarMovimientos();            
            setMovimientoExtraordinario( prev =>  ({
                ...prev,
                monto: "",
                descripcion: "",
                id_cuenta : null,
                id_categoria : null,
                referencia_id : 0 
            }));
            setModalEgresoIngreso(false);
        }else{
            setErrorGenerico(registroMovimientoResult.message)
        };
    };

};

 // --- Seteamos los estados para abrir y determinar q el listado sea Ingreso
const handleAbrirIngreso =  async () => {
    setMovimientoExtraordinario( prev => ({ ...prev, tipo : "ingreso"}));
    setModalEgresoIngreso(true);
    const servicioApiFetch = config.servicios.listadoCategoriaCaja;
    const listadoIngresos = await servicioApiFetch({
        id_escuela : config.id_escuela,
        tipo : "ingreso",
        estado : "activos"
    });
    
    setListadoExtraordionario(listadoIngresos.data);
};

 // --- Seteamos los estados para abrir y determinar q listado sea Egreso
const handleAbrirEgreso = async () => {
    setMovimientoExtraordinario( prev => ({ ...prev, tipo : "egreso"}));
    setModalEgresoIngreso(true);
    const servicioApiFetch = config.servicios.listadoCategoriaCaja;
    const listadoEgresos = await servicioApiFetch({
        id_escuela : config.id_escuela,
        tipo : "egreso",
        estado : "activos"
    });
    setListadoExtraordionario(listadoEgresos.data);
};


// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//                     SECCION HANDLES  ESTADO DE CAJA  ( ABIERTA / CERRADA ) 
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 



// ──────────────────────────────────────────────────────────────
//Hanldes para manejar los estados de caja
// ────────────────────────────────────────────────────────────── 

const handleEstadosCaja = () =>{
   
    try{
        setEnviando(true);
        if ( dataCaja.id_caja === null){
                setModalApertura(true);
        }else{
                setModalCierre(true);
        };
        
    }catch(error){

    }finally{
      setEnviando(false)  
    };
};

// ──────────────────────────────────────────────────────────────
//Handle para Cachear los monto iniciales
// ────────────────────────────────────────────────────────────── 

   // --- Capturamos el monto de las cuentas para determinar el saldo inical de cada una
const cachearMontoIniciales = (id_cuenta: number, nombre: string, valor: string) => {

    const montoFinal = valor === "" ? "" : Number(valor);

    if (valor !== "" && isNaN(Number(valor))) return;

    setAperturaDetalle((prev) => {
        const existe = prev.find((det) => det.id_cuenta === id_cuenta);

        if (existe) {
            return prev.map((det) =>
                det.id_cuenta === id_cuenta 
                    ? { ...det, monto: montoFinal as any }
                    : det
            );
        } else {
            return [...prev, { id_cuenta, nombre_cuenta: nombre, monto: montoFinal as any }];
        }
    });
};




// ──────────────────────────────────────────────────────────────
//  Handle para Abrir caja 
// ────────────────────────────────────────────────────────────── 

const handleAbrirCaja = async() =>{

    try{
        setEnviando(true);
        // Si es q un monto es "" lo limpiamos o lo colocamos en  0
        const detalleLimpiado = aperturaDetalle.map((item) => {
            const montoRaw = item.monto as unknown; 
            return {
                    ...item,
                    monto: montoRaw === "" ? 0 : Number(montoRaw)
            };
        });
        
        const data = {
            id_escuela : apertura.id_escuela,
            estado : apertura.estado,    
            id_usuario_apertura : apertura.id_usuario_apertura,    
            detalle : detalleLimpiado
        };

       const servicioApiFetch = config.servicios.abrirCaja;
       const aperturaCajaResult = await servicioApiFetch(data);
     
        if (aperturaCajaResult.code === "CAJA_ABIERTA_OK"){
            setModalApertura(false)
          
            setScrollState({
                loading: false,
                hasMore: true,
                offset: 0,
                limite: 5
            });
            setMovimientos([]); 
           
            setDataCaja( prev => ({
                ...prev,
                id_caja : aperturaCajaResult.data.id_caja
            }));
    
          setEstadoCaja("abierta");

        }else{
            setErrorGenerico(aperturaCajaResult.errorsDetails?.[0].message || "Error al abrir caja");
        };

    }catch(error){
        setErrorGenerico("Error al abrir caja");
    }finally{
      setEnviando(false)  
    };
};

// ──────────────────────────────────────────────────────────────
//  Handle para Cerrar caja
// ────────────────────────────────────────────────────────────── 

const handleCerrarCaja =async () =>{

    try{
        setEnviando(true);
        const dataCierre = {
            id_caja : dataCaja.id_caja,
            id_escuela : config.id_escuela,
            monto_final_real :  panelPrincial?.[0]?.balance_neto,
            id_usuario : config.id_usuario 
        };

        const servicioApiFetch = config.servicios.cerrarCaja;
        const cierreCajaResult = await servicioApiFetch(dataCierre);

        if (cierreCajaResult.code === "CIERRE_CAJA_OK"){
           
            setDataCaja( prev => ({
                ...prev,
                id_caja : null
            }));
            setEstadoCaja("cerrada");
            setDataCaja(prev => ({
                ...prev,
                id_caja : null
            }));
            setModalCierre(false);
        };

    }catch(error){
        setErrorGenerico("Error al cerrar caja");
    }finally{
        setEnviando(false)
    };
};

// ──────────────────────────────────────────────────────────────
//Handle para Cerrar Caja Abierta
// ────────────────────────────────────────────────────────────── 

const handleAbrirCajaModalCerrar = () =>{

    setModalApertura(false);
    setApertura({ id_escuela : config.id_escuela , estado : "abierta", id_usuario_apertura : config.id_usuario });
    setMovimientoExtraordinario({
        id_caja: dataCaja.id_caja ,
        id_categoria: null, // Aquí cae el ID del selector (ej: ID de 'Luz')
        id_cuenta : null,
        id_usuario : config.id_usuario,
        monto: "",
        descripcion: "",// Aquí podés poner "Pago de boleta Edesa"
        referencia_id : 0 ,// es cerro por defecto ya q no es una inscripcion     
        id_escuela : config.id_escuela,
        tipo :""
    });
};

// ──────────────────────────────────────────────────────────────
//Handle para Cerrar modal de cierre de caja
// ────────────────────────────────────────────────────────────── 

const handleCerrarModalCerrar = () =>{
    setModalCierre(false);
};

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//                     FUNCIONES PARA CARAGAR LOS DETALLES DE CAJA CON SCROLL INFINITO
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 


// ──────────────────────────────────────────────────────────────
//Metodo para cargar los movimientos de caja con scroll infinito
// ────────────────────────────────────────────────────────────── 

const cargarMovimientos = useCallback(async () => {
    // Si no hay ID, o ya está cargando, o no hay más: FRENAMOS
    if (!dataCaja.id_caja || scrollState.loading || !scrollState.hasMore) { return }; 

    setScrollState(prev => ({ ...prev, loading: true }));

    try {
        const dataDetalle = {
            id_caja: dataCaja.id_caja,
            limite: scrollState.limite,
            offset: scrollState.offset
        };

        const res = await config.servicios.movimientoCajaDetalle(dataDetalle);
       
        if (res.code === "MOVIMIENTOS_CAJA_OK") {
            setMovimientos(prev => [...prev, ...res.data]);
            setScrollState(prev => ({
                ...prev,
                loading: false,
                offset: prev.offset + prev.limite,
                hasMore: res.data.length === prev.limite
            }));
        } else {
            setScrollState(prev => ({ ...prev, loading: false, hasMore: false }));
        }
    } catch (error) {
        setScrollState(prev => ({ ...prev, loading: false }));
    };
}, [dataCaja.id_caja, scrollState.offset, scrollState.limite, scrollState.hasMore, scrollState.loading]);


// ──────────────────────────────────────────────────────────────
// Configuración del IntersectionObserver para el scroll infinito
// ────────────────────────────────────────────────────────────── 
const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    // 1. Si está cargando, no hacemos nada
    if (scrollState.loading) return;

    // 2. Si ya existía un observador, lo desconectamos para limpiar
    if (observer.current) observer.current.disconnect();

    // 3. Creamos el nuevo observador
    observer.current = new IntersectionObserver(entries => {
        // Si el div es visible en pantalla Y hay más datos por cargar...
        if (entries[0].isIntersecting && scrollState.hasMore) {
            // ...disparamos la función que ya tiene el offset actualizado
            cargarMovimientos();
        }
    });
   
    // 4. Le decimos al observador que mire el div (el nodo)
    if (node) observer.current.observe(node); 

}, [scrollState.loading, scrollState.hasMore, cargarMovimientos, dataCaja.id_caja]); // Dependencias: cargarMovimientos y dataCaja.id_caja (porque se usa dentro de cargarMovimientos)
// Importante: cargarMovimientos debe estar en las dependencias


// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//                      USEEFECT SECCION 1-IDCAJA    2-METRICAS   3-DETALLE DE CAJA  4- LISTA TIPO CUENTAS  5-METRICAS PANEL PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 
// ──────────────────────────────────────────────────────────────
//Obtener id de caja
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const idCaja = async () => {
    
        const idCajaResult = await idCajaFuntion(config.id_escuela);
        
        if ( idCajaResult){
           
            setDataCaja( prev => ({
                ...prev,
                id_caja : idCajaResult
            }));
            setMovimientoExtraordinario( prev => ({
                ...prev, id_caja : idCajaResult
            }));
            setEstadoCaja("abierta");
            setErrorGenerico(null);
        }else{ 
            setEstadoCaja("cerrada")
        };
    };
    idCaja();
},[]);  

// ──────────────────────────────────────────────────────────────
//Obtener las metricas para el panel metodos de pago
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const metricas = async () => {
        const servicioApiFetch = config.servicios.metricasPanelCaja;
        const metricasCajaResult = await servicioApiFetch(dataCaja);

        if (metricasCajaResult.code ===  "METRICAS_CAJA_CUENTAS_OK" ){
           // console.log(metricasCajaResult)
        // const totalCuenta =metricasCajaResult.data.find(
        //      (cuenta: metricasTipoCuentas)  => cuenta.id_cuenta === "TOTAL" );
        //         setPanelPrincial(prev => {
        //             if (!prev || prev.length === 0) return prev;
        //             return [
        //                 {
        //                     ...prev[0], 
        //                     balance_neto: totalCuenta ? Number(totalCuenta.saldo_actual || 0) : 0
        //                 }
        //             ];
        //         });

            setMetricasTipoCuentas(metricasCajaResult.data)
        }else{
            setMetricasTipoCuentas(null)
            // setPanelPrincial(prev => 
            //     prev && prev.length > 0 
            //         ? [{ ...prev[0], balance_neto: 0 }] 
            //         : prev
            // );
        };
    };

    metricas();

},[dataCaja.id_caja, actualizarIngresoInscipcion, estadoCaja, disparadorRefresco]);    


// ──────────────────────────────────────────────────────────────
//Obtener  los movimientos de caja para el detalle
// ────────────────────────────────────────────────────────────── 

useEffect(() => {

    if (dataCaja.id_caja) {
        cargarMovimientos();
    } else {
      
        setMovimientos([]);
        setScrollState({
            loading: false,
            hasMore: true,
            offset: 0,
            limite: 5
        });
    }
}, [dataCaja.id_caja, cargarMovimientos]);

// ──────────────────────────────────────────────────────────────
// Obtener el listado de tipo cuentas activas para el selector de movimiento extraordinario
// ──────────────────────────────────────────────────────────────
     
useEffect( ()=> {

    const obtenerListadoCuentas = async () => {
        const servicioApiFetch = config.servicios.listadoTipoCuentas;
        const resultListacoCuentas = await servicioApiFetch( filtroCuentasEstatica);
       
        if ( resultListacoCuentas.code === "LISTA_TIPOS_CUENTAS_OK"){
            setListadoCuentasActivas(resultListacoCuentas.data);
            const detallesIniciales = resultListacoCuentas.data.map((cuenta: ListadoTipoCuentas) => ({
                id_cuenta: cuenta.id_cuenta,
                nombre_cuenta: cuenta.nombre_cuenta,
                monto: "" // Nacen en cero para que no fallen al enviar
            }));

            setAperturaDetalle(detallesIniciales);
        }else{
            setListadoCuentasActivas([]);
            setErrorGenerico(resultListacoCuentas.message || "Error sin listado cuentas" );
        };
    };

    obtenerListadoCuentas();

}, []);

// ──────────────────────────────────────────────────────────────
// Obtener los montos de las metricas del panel proncipal
// ──────────────────────────────────────────────────────────────

useEffect( ()=> {

    const metricasPrincipalCaja = async () =>{
        const servicioApiFetch = config.servicios.metricasPanelPrincipal;
        const metricasResult = await servicioApiFetch(dataCaja);
      
        if (metricasResult.code === 'METRICAS_PRINCIPAL_OK'){   
            setPanelPrincial(metricasResult.data);  
        }else{
            setPanelPrincial(null);
        };
    };

    metricasPrincipalCaja();

}, [ dataCaja.id_caja , actualizarIngresoInscipcion, modalApertura , movimientoExtraordinario] );


    return{
        apertura,

        handleEstadosCaja,
        handleAbrirCajaModalCerrar,
        handleAbrirCaja,
        handleCerrarModalCerrar,
        handleCerrarCaja,

        cachearMontoIniciales,

        errorGenerico,

        estadoCaja,
        modalApertura,
        modalCierre,
        modalEgresoIngreso,
        enviando,

        lastElementRef,
        movimientos,
        scrollState,

       
        movimientoExtraordinario,
        listadoExtraordinario,
        handleMovimientoExtraordinarioChange,
        handleTipoPagoChange,
        handleCerrarModalEgrIng,
        handRegistarMovimientoExtraordinario,
        handleMontoChange,
        handleMemoChange,
        handleAbrirEgreso,
        handleAbrirIngreso,

        metricasTipoCuentas,
        listadoCuentasActivas,
        panelPrincial,
    

        aperturaDetalle,
    };
};    
