import { useState , useEffect , useCallback, useRef} from "react";
import { useIncripcionesUsuarios } from "../hookNegocios/Inscripciones";


//Seccion de Tipados--------------------------------------
import  { type DataCaja , type DataMetricasResult, type DataAperturaCaja,
          type EstadoCaja, type DetalleCajaMovimientoResult , type scrollStateData
        } from "../tipadosTs/caja.typado"
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface DataCajaUsuariosConfig {
    id_escuela : number, 
    
    servicios : {
         metricasPanelCaja : ServicioCrud,
         obtenerIdCaja     : ServicioCrud,
         abrirCaja : ServicioCrud,
         cerrarCaja : ServicioCrud,
         movimientoCajaDetalle : ServicioCrud
    }
};

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
  //  type estadoRegistro = null | "ingreso" | "egreso";

    const [modalEgresoIngreso , setModalEgresoIngreso] = useState<boolean>(false);
    const [movimientoExtraordinario, setMovimientoExtraordinario] = useState({
        id_caja: dataCaja.id_caja,
        id_categoria: "", // Aquí cae el ID del selector (ej: ID de 'Luz')
        monto: "",
        metodo_pago: "efectivo",
        estado : "" ,
        descripcion: "",   // Aquí podés poner "Pago de boleta Edesa"   
    });


const handleMovimientoExtraordinarioChange = (e: React.ChangeEvent< HTMLSelectElement>) => {
 //   console.log( e.target.value)
 //   console.log( e.target.name)
    if (e.target.value ){
        setMovimientoExtraordinario( prev => ({
            ...prev,
            [e.target.name]: e.target.value,
            estadoRegistro : true
        }));
    }else{
        console.log("nulo")      
    };
};

const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    console.log(value)
    if (value){
        setMovimientoExtraordinario( prev => ({
            ...prev,
            [name]: value
        }));        
    }else{
        setMovimientoExtraordinario( prev => ({
            ...prev,
            monto : ""
        }));        
    };
};

console.log(movimientoExtraordinario)

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

const handRegistarMovimientoExtraordinario = () => {
    console.log("Registro de moviemiento extra");
};
 //console.log(movimientoExtraordinario)
const handleAbrirIngreso = () => {
    setMovimientoExtraordinario( prev => ({ ...prev, estado : "ingreso"}));
    setModalEgresoIngreso(true);
};

const handleAbrirEgreso = () => {
    setMovimientoExtraordinario( prev => ({ ...prev, estado : "egreso"}));
    setModalEgresoIngreso(true);
};

// ──────────────────────────────────────────────────────────────
//Hanldes para manejar los estados de caja
// ────────────────────────────────────────────────────────────── 

const handleEstadosCaja = () =>{
    try{
        setEnviando(true);
        if ( dataCaja.id_caja === null){
                console.log("cerrada caja")
                setModalApertura(true);
        }else{
                console.log("abierta caja")
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
//Handle para Abrir caja 
// ────────────────────────────────────────────────────────────── 

const handleAbrirCaja = async() =>{
    try{
      setEnviando(true);
      const servicioApiFetch = config.servicios.abrirCaja;
      const aperturaCajaResult = await servicioApiFetch(apertura);
    
        if (aperturaCajaResult.code === "CAJA_ABIERTA_OK"){
            setModalApertura(false)
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
//Handle para Cerrar caja
// ────────────────────────────────────────────────────────────── 

const handleCerrarCaja =async () =>{
    console.log("cerrar caja");

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
            setModalCierre(false);
            setEstadoCaja("cerrada");
            setDataCaja(prev => ({
                ...prev,
                id_caja : null
            }));
        };

    }catch(error){
        setErrorGenerico("Error al cerrar caja");
    }finally{
        setEnviando(false)
    };
};

// ──────────────────────────────────────────────────────────────
//Handle para Cerrar Caja ABierta
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

// ──────────────────────────────────────────────────────────────
//Handle para Cerrar modal de INGRESO / EGRESO EXTRAORDINARIO
// ────────────────────────────────────────────────────────────── 

const handleCerrarModalEgrIng = () =>{
    setModalEgresoIngreso(false)
};

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



// ──────────────────────────────────────────────────────────────
//Obtener id de caja
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const idCaja = async () => {
        const servicioApiFetch = config.servicios.obtenerIdCaja;
        const idCajaResult  = await servicioApiFetch(config.id_escuela);
 
        if ( idCajaResult.code === "ID_CAJA_OK" && idCajaResult.data){
           
            setDataCaja( prev => ({
                ...prev,
                id_caja : idCajaResult.data.id_caja
            }));
            setEstadoCaja("abierta");
            setErrorGenerico(null);
        }else{ 
            setEstadoCaja("cerrada")
        };
    };
    idCaja();
},[estadoCaja]);  

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

},[dataCaja.id_caja, actualizarIngresoInscipcion, estadoCaja]);    


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

        movimientoExtraordinario,
        handleMovimientoExtraordinarioChange,
        handleCerrarModalEgrIng,
        handRegistarMovimientoExtraordinario,
        handleMontoChange,
        handleMemoChange,
        handleAbrirEgreso,
        handleAbrirIngreso

    };
};    
