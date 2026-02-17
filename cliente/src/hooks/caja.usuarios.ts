import { useState , useEffect } from "react";
import { useIncripcionesUsuarios } from "../hookNegocios/Inscripciones";




type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface DataCajaUsuariosConfig {
    id_escuela : number, 
    
    servicios : {
         metricasPanelCaja : ServicioCrud,
         obtenerIdCaja     : ServicioCrud,
         abrirCaja : ServicioCrud,
         cerrarCaja : ServicioCrud
    }
};

export const  useCajaUsuario = ( config : DataCajaUsuariosConfig ) =>{
    const { actualizarIngresoInscipcion } = useIncripcionesUsuarios();//  para actrualizar los parametros por la inscripcion

    type EstadoCaja = "abierta" | "cerrada";

    interface DataCaja{
        id_caja : number | null,
        id_escuela : number | null
    };

    interface DataMetricasResult {
        monto_inicial: number;
        total_ingresos: number;
        total_egresos: number;
        flujo_del_dia: number;
        total_efectivo: number;
        total_transferencia: number;
        total_debito: number;
        total_credito: number;
        balance_total_real: number;
    };

    interface DataAperturaCaja{
       id_escuela : number | null,
       estado : EstadoCaja
       id_usuario : null // es por el momento 
       monto_inicial : number | string
    };

    const [modalApertura , setModalApertura] = useState<boolean>(false);
    const [modalCierre , setModalCierre] = useState<boolean>(false);
    const [dataCaja, setDataCaja] = useState<DataCaja>({id_caja : null , id_escuela : config.id_escuela});

    const [apertura ,setApertura] = useState<DataAperturaCaja>({
        id_escuela : config.id_escuela , estado : "abierta", id_usuario : null, monto_inicial : "" 
    });

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
//Obtener id de caja
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const idCaja = async () => {
        const servicioApiFetch = config.servicios.obtenerIdCaja;
        const idCajaResult  = await servicioApiFetch(config.id_escuela);
 
        if ( idCajaResult.code === "ID_CAJA_OK" && idCajaResult.data){
            console.log("aQUI")
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
        enviando
    };
};    
