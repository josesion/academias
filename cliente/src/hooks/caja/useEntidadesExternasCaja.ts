import { useEffect, useRef } from "react";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

import type {
   CajaTipado,
   CajaAction
} from "../../reducers/cajaReducers";

//Seccion de Tipados--------------------------------------
import type{ListadoTipoCuentas} from "../../tipadosTs/caja.typado";

interface EntidadesExternasCajaConfig {    
    servicios : {
         listadoTipoCuentas : ServicioCrud,
         cuentasSesion  : ServicioCrud,
    },
    state: CajaTipado;
    dispatch: React.Dispatch<CajaAction>;    
};


export const useEntidadesExternasCaja = ( config : EntidadesExternasCajaConfig) => {
    const { state ,dispatch} = config;

   const filtroCuentasEstatica = {
        estado : "activos"
   }; 

   // Track initial load for cuentasSesion (cuentasActivas runs once on mount)
   const initialLoadRef = useRef({ cuentasSesion: true });

// ──────────────────────────────────────────────────────────────
// Obtener el listado de tipo cuentas activas para el selector de movimiento extraordinario
// ──────────────────────────────────────────────────────────────

useEffect( ()=> {

    const obtenerListadoCuentas = async () => {
        dispatch({ type: "SET_CARGA_CUENTAS_ACTIVAS", payload: true });
        const servicioApiFetch = config.servicios.listadoTipoCuentas;
        const resultListacoCuentas = await servicioApiFetch( filtroCuentasEstatica);

        if ( resultListacoCuentas.code === "LISTA_TIPOS_CUENTAS_OK"){
            dispatch({
                type : "SET_LISTADO_CUENTAS_ACTIVAS",
                payload : resultListacoCuentas.data
            });
          //   setListadoCuentasActivas(resultListacoCuentas.data);
            const detallesIniciales = resultListacoCuentas.data.map((cuenta: ListadoTipoCuentas) => ({
                id_cuenta: cuenta.id_cuenta,
                nombre_cuenta: cuenta.nombre_cuenta,
                monto: "" // Nacen en cero para que no fallen al enviar
            }));

            dispatch({ type : "SET_APERTURA_DETALLE" , payload : detallesIniciales})

        }else{
            dispatch({
                type : "SET_LISTADO_CUENTAS_ACTIVAS",
                payload : []
            });
            dispatch({
                type : "SET_ERROR",
                payload : resultListacoCuentas.message || "Error sin listado cuentas" 
            });
        };
        dispatch({ type: "SET_CARGA_CUENTAS_ACTIVAS", payload: false });
    };

    obtenerListadoCuentas();

}, []);

// ──────────────────────────────────────────────────────────────
// Obtener el listado de tipo cuentas de que se asignaron en el momento de la partura de caja
// ──────────────────────────────────────────────────────────────

useEffect( ()=> {

    const obtenerListadoCuentasSession = async () => {
        // Solo loading global en carga inicial
        if (initialLoadRef.current.cuentasSesion) {
            dispatch({ type: "SET_CARGA_CUENTAS_SESION", payload: true });
            initialLoadRef.current.cuentasSesion = false;
        }
        const servicioApiFetch = config.servicios.cuentasSesion;
        const resultListacoCuentas = await servicioApiFetch({});
       
        if ( resultListacoCuentas.code === "LISTA_TIPOS_CUENTAS_OK"){
            dispatch({
                type : "SET_LISTADO_CUENTAS_SESION",
                payload : resultListacoCuentas.data
            });
     
            const detallesIniciales = resultListacoCuentas.data.map((cuenta: ListadoTipoCuentas) => ({
                id_cuenta: cuenta.id_cuenta,
                nombre_cuenta: cuenta.nombre_cuenta,
                monto: "" // Nacen en cero para que no fallen al enviar
            }));

          dispatch({ type : "SET_LISTADO_CUENTAS_SESION" , payload : detallesIniciales})

        }else{
            dispatch({
                type : "SET_LISTADO_CUENTAS_SESION",
                payload : []
            });
            dispatch({
                type : "SET_ERROR",
                payload : resultListacoCuentas.message || "Error sin listado cuentas" 
            });
        };
        if (initialLoadRef.current.cuentasSesion === false) {
            dispatch({ type: "SET_CARGA_CUENTAS_SESION", payload: false });
        }
    };

    obtenerListadoCuentasSession();

}, [state.actualizarMetodoPago]);


// ──────────────────────────────────────────────────────────────
// Obtener los metodos de pago para mandarlos al cierre de caja
// ──────────────────────────────────────────────────────────────

useEffect( ()=> {

    if ( state.metricasTipoCuentas  && state.metricasTipoCuentas.length > 0){

        dispatch({ 
            type: 'INICIALIZAR_METODO_PAGO', 
            payload: state.metricasTipoCuentas 
        });

    };

},[state.metricasTipoCuentas]); 

return;

};