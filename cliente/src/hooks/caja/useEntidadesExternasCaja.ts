import { useEffect } from "react";

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
    },
    state: CajaTipado;
    dispatch: React.Dispatch<CajaAction>;    
};


export const useEntidadesExternasCaja = ( config : EntidadesExternasCajaConfig) => {
    const { state ,dispatch} = config;

   const filtroCuentasEstatica = {
        id_escuela : state.dataCaja.id_escuela,
        estado : "activos"
   }; 


// ──────────────────────────────────────────────────────────────
// Obtener el listado de tipo cuentas activas para el selector de movimiento extraordinario
// ──────────────────────────────────────────────────────────────
useEffect( ()=> {

    const obtenerListadoCuentas = async () => {
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

            //setAperturaDetalle(detallesIniciales);
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
    };

    obtenerListadoCuentas();

}, []);


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