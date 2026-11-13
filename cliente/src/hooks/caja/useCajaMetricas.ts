import { useEffect, useRef } from "react";


type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

import type {
   CajaTipado,
   CajaAction
} from "../../reducers/cajaReducers";

interface MetricasCajaConfig {
       
    servicios : {
         metricasPanelCaja : ServicioCrud,
         movimientoCajaDetalle : ServicioCrud,
         metricasPanelPrincipal :ServicioCrud
    },

    state: CajaTipado;
    dispatch: React.Dispatch<CajaAction>;
};


export const useCajaMetricas = ( config : MetricasCajaConfig) => {
   
    const { state, dispatch} = config;

   // VER EL TEMA DE Q CUANDO SE HAGA UNA INSCRIPCION ACTULIZT EL LISTADO  
   // const { actualizarIngresoInscipcion } = useIncripcionesUsuarios();

   // Track initial load to show global spinner only once
   const initialLoadRef = useRef({ metricas: true, panel: true });

// ──────────────────────────────────────────────────────────────
//Obtener el monto real contado por el usuario
// ──────────────────────────────────────────────────────────────     
 useEffect(() => {
    // 1. Tomamos la lista del Reducer
    const listaParaCalcular = state.metricasCuentasCierre || [];
    
    // 2. Calculamos el total
    const total = listaParaCalcular.reduce((acc, cuenta) => {
        return acc + (Number(cuenta.monto_real) || 0);
    }, 0);

    // 3. Lo guardamos en el useState local

    dispatch({ type : "SET_MONTO_FINAL" , payload : total})

}, [state.metricasCuentasCierre, state.disparadorRefresco]);
   

// ──────────────────────────────────────────────────────────────
//Obtener las metricas para el panel metodos de pago
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const metricas = async () => {
        // Solo loading global en carga inicial
        if (initialLoadRef.current.metricas) {
            dispatch({ type: "SET_CARGA_METRICAS_TIPOS", payload: true });
            initialLoadRef.current.metricas = false;
        }
        const servicioApiFetch = config.servicios.metricasPanelCaja;
        const data = {
            id_caja : state.dataCaja.id_caja,
        };

        const metricasCajaResult = await servicioApiFetch(data);

        if (metricasCajaResult.code ===  "METRICAS_CAJA_CUENTAS_OK" ){

            dispatch({ type : "SET_METRICAS_TIPO_CUENTAS" , payload : metricasCajaResult.data });
           
        }else{
         
           dispatch({ type : "SET_METRICAS_TIPO_CUENTAS" , payload : null });

        };
        if (initialLoadRef.current.metricas === false) {
            dispatch({ type: "SET_CARGA_METRICAS_TIPOS", payload: false });
        }
    };

    metricas();

},[state.dataCaja.id_caja, state.estadoCaja, state.disparadorRefresco, state.actualizarCaja] );  


// ──────────────────────────────────────────────────────────────
// Obtener los montos de las metricas del panel proncipal
// ──────────────────────────────────────────────────────────────

useEffect( ()=> {

    const metricasPrincipalCaja = async () =>{
        // Solo loading global en carga inicial
        if (initialLoadRef.current.panel) {
            dispatch({ type: "SET_CARGA_PANEL_PRINCIPAL", payload: true });
            initialLoadRef.current.panel = false;
        }
        const servicioApiFetch = config.servicios.metricasPanelPrincipal;
        const metricasResult = await servicioApiFetch(state.dataCaja);
      
        if (metricasResult.code === 'METRICAS_PRINCIPAL_OK'){   
            dispatch({ type : "SET_PANEL_PRINCIPAL" , payload : metricasResult.data });
        }else{

            dispatch({ type : "SET_PANEL_PRINCIPAL" , payload : null });

        };
        if (initialLoadRef.current.panel === false) {
            dispatch({ type: "SET_CARGA_PANEL_PRINCIPAL", payload: false });
        }
    };

    metricasPrincipalCaja();

}, [ state.dataCaja.id_caja,  state.movimientoExtraordinario, state.actualizarCaja] );





    return ;

};