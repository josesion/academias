import { useState , useEffect , useCallback, useRef} from "react";
import { useIncripcionesUsuarios } from "../hookNegocios/Inscripciones";
// utils -------------------------------------------------------------
import { idCajaFuntion } from "../utils/idCaja";

//Seccion de Tipados--------------------------------------
import  { type DataCaja , type DataMetricasResult, type DataAperturaCaja,
          type EstadoCaja, type DetalleCajaMovimientoResult , type scrollStateData,
          type Categoria,  type RegistroDetalleCaja, type  Tipo_pago
        } from "../tipadosTs/caja.typado"
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;



interface DataCajaUsuariosConfig {
    id_escuela : number, 
    
    servicios : {
         metricasPanelCaja : ServicioCrud,
         obtenerIdCaja     : ServicioCrud,
         abrirCaja : ServicioCrud,
         cerrarCaja : ServicioCrud,
         movimientoCajaDetalle : ServicioCrud,
         listadoCategoriaCaja : ServicioCrud,
         registrarMovimientoCaja : ServicioCrud,
    }
};


  const tipo_pago: Tipo_pago[] = [
    {
      id_tipo_pago: 1,
      nombre_tipo_pago: "efectivo",
    },
    {
      id_tipo_pago: 2,
      nombre_tipo_pago: "transferencia",
    },
    {
      id_tipo_pago: 3,
      nombre_tipo_pago: "credito",
    },
    {
      id_tipo_pago: 4,
      nombre_tipo_pago: "debito",
    },
  ];

export const  useCajaUsuario = ( config : DataCajaUsuariosConfig ) =>{

    const { actualizarIngresoInscipcion } = useIncripcionesUsuarios();//  para actrualizar los parametros por la inscripcion


  //------------------  estados para manejar la logica de caja  ------------------  .
    const [modalApertura , setModalApertura] = useState<boolean>(false);
    const [modalCierre , setModalCierre] = useState<boolean>(false);
    const [dataCaja, setDataCaja] = useState<DataCaja>({id_caja : null , id_escuela : config.id_escuela});
    const [apertura ,setApertura] = useState<DataAperturaCaja>({
        id_escuela : config.id_escuela , estado : "abierta", id_usuario : null, monto_inicial : "" 
    });
   //------------------  metricas de caja  ------------------  .
    const [disparadorRefresco , setDisparadorRefresco] = useState<number>(0);
    const [montoInicial, setMontoInicial] = useState<number>(0);
    const [totalIngresos, setTotalIngresos] = useState<number>(0);
    const [totalEgresos, setTotalEgresos] = useState<number>(0);
    const [flujoDelDia, setFlujoDelDia] = useState<number>(0);
    const [totalEfectivo, setTotalEfectivo] = useState<number>(0);
    const [totalTransferencia, setTotalTransferencia] = useState<number>(0);
    const [totalDebito, setTotalDebito] = useState<number>(0);
    const [totalCredito, setTotalCredito] = useState<number>(0);
    const [balanceTotalReal, setBalanceTotalReal] = useState<number>(0);

    const [errorGenerico, setErrorGenerico] = useState< string | null >(null);
    const [enviando , setEnviando] = useState<boolean>(false);
    const [estadoCaja, setEstadoCaja] = useState<EstadoCaja>("cerrada");

    const actualizarMetricas = (data : DataMetricasResult) => {
        setMontoInicial(Number(data.monto_inicial));
        setTotalIngresos(Number(data.total_ingresos));
        setTotalEgresos(Number(data.total_egresos));
        setFlujoDelDia(Number(data.flujo_del_dia));
        setTotalEfectivo(Number(data.total_efectivo));
        setTotalTransferencia(Number(data.total_transferencia));
        setTotalDebito(Number(data.total_debito));
        setTotalCredito(Number(data.total_credito));
        setBalanceTotalReal(Number(data.balance_total_real));
    };

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
        monto: "",
        metodo_pago: "efectivo",
        descripcion: "",// Aquí podés poner "Pago de boleta Edesa"
        tipo : "",
        referencia_id : 0 // es cerro por defecto ya q no es una inscripcion     
    });
    const [listadoExtraordinario , setListadoExtraordionario] = useState<Categoria[] | null>( null);


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

const handleCerrarModalEgrIng = () =>{
    setListadoExtraordionario( null );
    setMovimientoExtraordinario({
        id_caja: dataCaja.id_caja ,
        id_categoria: null, // Aquí cae el ID del selector (ej: ID de 'Luz')
        monto: "",
        metodo_pago: "efectivo",
        descripcion: "",// Aquí podés poner "Pago de boleta Edesa"
        tipo : "",
        referencia_id : 0 // e
    });
    setModalEgresoIngreso(false);
    setErrorGenerico(null)
};

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


const handRegistarMovimientoExtraordinario = async () => {

    if ( !verificadorSelector  || movimientoExtraordinario.monto === "" || !verificadorSelectorTipo  ) {
        setErrorGenerico("Verificar los campos del formulario")
    }else{
        const servicioApiFetch =config.servicios.registrarMovimientoCaja;
        const registroMovimientoResult = await servicioApiFetch({
            id_caja       : dataCaja.id_caja,
            id_categoria  : Number(movimientoExtraordinario.id_categoria),
            monto         : Number(movimientoExtraordinario.monto),
            metodo_pago   : movimientoExtraordinario.metodo_pago,
            descripcion   : movimientoExtraordinario.descripcion,
            referencia_id : 0   
        }); 
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
                metodo_pago: "efectivo",
                descripcion: "",
                tipo : "",
                referencia_id : 0 
            }));
            setModalEgresoIngreso(false);
        }else{
            setErrorGenerico(registroMovimientoResult.message)
        };
    };

};


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
//Handle para Cachear el mono inicial
// ────────────────────────────────────────────────────────────── 

const cachearMontoInicial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    setApertura((prev) => ({
        ...prev,
        [name]: Number(value)
    }));
};

// ──────────────────────────────────────────────────────────────
//  Handle para Abrir caja 
// ────────────────────────────────────────────────────────────── 

const handleAbrirCaja = async() =>{
    try{
      setEnviando(true);
      const servicioApiFetch = config.servicios.abrirCaja;
      const aperturaCajaResult = await servicioApiFetch(apertura);
       
        if (aperturaCajaResult.code === "CAJA_ABIERTA_OK"){
            setModalApertura(false)
            setDataCaja( prev => ({
                ...prev,
                id_caja : aperturaCajaResult.data.id
            }));
            setEstadoCaja("abierta");
            setApertura( prev =>({
                ...prev,
                monto_inicial : ""
            }));
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
            monto_final_real : balanceTotalReal
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
//                      USEEFECT SECCION 1-IDCAJA    2-METRICAS   3-DETALLE DE CAJA 
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
//Obtener las metricas para el panel 
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const metricas = async () => {
        const servicioApiFetch = config.servicios.metricasPanelCaja;
        const metricasCajaResult = await servicioApiFetch(dataCaja);

        if (metricasCajaResult.code === "METRICAS_OK"){
                
                actualizarMetricas(metricasCajaResult.data);
                setErrorGenerico(null);
        }
        else{
            actualizarMetricas({
                monto_inicial: 0,
                total_ingresos: 0,
                total_egresos: 0,
                flujo_del_dia: 0,
                total_efectivo: 0,
                total_transferencia: 0,
                total_debito: 0,
                total_credito: 0,
                balance_total_real: 0
             });
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
        // Si el ID es null (Caja cerrada), reseteamos todo
        setMovimientos([]);
        setScrollState({
            loading: false,
            hasMore: true,
            offset: 0,
            limite: 5
        });
    }
}, [dataCaja.id_caja, cargarMovimientos]);

    return{
        montoInicial,
        totalIngresos, 
        totalEgresos, 
        flujoDelDia, 
        totalEfectivo, 
        totalTransferencia, 
        totalDebito, 
        totalCredito, 
        balanceTotalReal, 

        apertura,

        handleEstadosCaja,
        handleAbrirCajaModalCerrar,
        handleAbrirCaja,
        handleCerrarModalCerrar,
        handleCerrarCaja,

        cachearMontoInicial,

        errorGenerico,

        estadoCaja,
        modalApertura,
        modalCierre,
        modalEgresoIngreso,
        enviando,

        lastElementRef,
        movimientos,
        scrollState,

        tipo_pago,
        movimientoExtraordinario,
        listadoExtraordinario,
        handleMovimientoExtraordinarioChange,
        handleTipoPagoChange,
        handleCerrarModalEgrIng,
        handRegistarMovimientoExtraordinario,
        handleMontoChange,
        handleMemoChange,
        handleAbrirEgreso,
        handleAbrirIngreso

    };
};    
