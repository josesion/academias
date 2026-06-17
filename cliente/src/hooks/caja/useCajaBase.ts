import {  useEffect , useReducer } from "react";

// utils -------------------------------------------------------------
import { idCajaFuntion } from "../../utils/idCaja";
import { cajaReducer, initialState } from  "../../reducers/cajaReducers";

import type { JsonDataCierre, DataCierreCaja } from "../../tipadosTs/caja.typado"; 

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;



interface CajaBaseConfig {
 
   usuario: string;

   servicios: {
      abrirCaja: ServicioCrud;
      cerrarCaja: ServicioCrud;
      obtenerIdCaja: ServicioCrud;
   };
}

export const useCajaBase = ( config : CajaBaseConfig) => {

    const [ state , dispatch] = useReducer( cajaReducer, initialState({
        usuario    : config.usuario,
    }));



// ──────────────────────────────────────────────────────────────
//Handle para Cachear los monto iniciales
// ────────────────────────────────────────────────────────────── 

   // --- Capturamos el monto de las cuentas para determinar el saldo inical de cada una
const cachearMontoIniciales = (id_cuenta: number, nombre: string, valor: string) => {

    const montoFinal = valor === "" ? "" : Number(valor);
    const idCuenta = id_cuenta;

    if (valor !== "" && isNaN(Number(valor))) return;

    dispatch({ type : "UPDATE_MONTO_APERTURA_DETALLE", payload : {  nombreCuenta : nombre , valorCuenta : montoFinal}});
};


// ──────────────────────────────────────────────────────────────
//Hanldes para manejar los estados de caja
// ────────────────────────────────────────────────────────────── 

const handleEstadosCaja = () =>{
   
    try{
         dispatch({ type : "INICIAR_OPERACION"});
        if ( state.dataCaja.id_caja === null){
                dispatch({
                    type : "ABRIR_MODAL",
                    payload : "apertura"
                });
        }else{
                dispatch({
                    type : "ABRIR_MODAL",
                    payload : "cierre"
                });
        };
        
    }catch(error){

    }finally{
       dispatch({ type : "CARGADO"})
    };
};

// ──────────────────────────────────────────────────────────────
//  Handle para Abrir caja 
// ────────────────────────────────────────────────────────────── 

const handleAbrirCaja = async() =>{

    try{
         dispatch({ type : "INICIAR_OPERACION"});

        // Si es q un monto es "" lo limpiamos o lo colocamos en  0
        const detalleLimpiado = state.aperturaDetalle?.map((item) => {
            const montoRaw = item.monto as unknown; 
            return {
                    ...item,
                    monto: montoRaw === "" ? 0 : Number(montoRaw)
            };
        });
        
        const data = {
            estado : "abierta",    
            detalle : detalleLimpiado // a modificar mas a delante
        };

        
       const servicioApiFetch = config.servicios.abrirCaja;
       const aperturaCajaResult = await servicioApiFetch(data);


        if (aperturaCajaResult.code === "CAJA_ABIERTA_OK"){
            dispatch({ type : "CERRAR_MODALES"});
            dispatch({ type : "ABRIR_MODAL_ANIMACION_APERTURA"});    

            dispatch({
                type : "SET_CAJA_ACTIVA",
                payload : { 
                     id_caja : aperturaCajaResult.data.id_caja,
                     estado  : "abierta"
                 }
            });

            setTimeout(() => {  
               dispatch({ type : "CERRAR_MODAL_ANIMACION_APERTURA"});                
            }, 2000);             
    
        }else{
            dispatch({
                type : "SET_ERROR",
                payload : aperturaCajaResult.errorsDetails?.[0].message || "Error al abrir caja"
            });
        };

    }catch(error){
        dispatch({
            type : "SET_ERROR",
            payload :"Error servidor,  al abrir caja "
        });        
    }finally{
       dispatch({ type : "CARGADO"})
    };
};


// ──────────────────────────────────────────────────────────────
//  Handle para Cerrar caja
// ────────────────────────────────────────────────────────────── 
  

const handleCerrarCaja =async () =>{
  

    if (!state.dataCaja?.id_caja) {
        dispatch({
            type : "SET_ERROR",
            payload :"Error: No se encontró un ID de caja activo."
        });          
        return;
    }


    let dataDetalleCuentas : JsonDataCierre[] = [];
  

    if (state.metricasTipoCuentas && state.metricasTipoCuentas.length > 0) {
    
           dataDetalleCuentas = state.metricasTipoCuentas.map((item) => {
                return {
                    id_cuenta: Number(item.id_cuenta), // Aseguramos que sea number
                    nombre_cuenta: item.nombre_cuenta,
                    sistema: item.saldo_final_cuenta,   // Lo que el sistema dice que hay
                    real: item.movimiento_sesion,      // Inicializamos 'real' con lo mismo (el usuario luego lo edita)
                };
           });
    };
    
    let dataCierreCaja :  DataCierreCaja  | null=  null ;

    if (!dataDetalleCuentas || dataDetalleCuentas.length === 0) {
       dispatch({ type : "SET_ERROR" , payload :"No se pudo generar el detalle del arqueo" })
       return; 
    }
    
    if ( state.panelPrincipal &&  state.dataCaja.id_caja ){
    
        dataCierreCaja = {
                id_caja: state.dataCaja.id_caja,
            
                monto_final_real: Number(state.montoRealFinal), 
                monto_sistema: state.panelPrincipal[0].balance_neto ?? 0,
                diferencia_total: Number(state.montoRealFinal) - state.panelPrincipal[0].balance_neto,
                arqueo_detalle: dataDetalleCuentas,
                observaciones_cierre : state.observaciones 
        };
    };

    try{
        dispatch({ type : "INICIAR_OPERACION"});

         const servicioApiFetch = config.servicios.cerrarCaja;
         const cierreCajaResult = await servicioApiFetch( dataCierreCaja );
    
        if (cierreCajaResult.code === "CIERRE_CAJA_OK"){
           
            dispatch({type : "ABRIR_MODAL_ANIMACION" });
            dispatch({type : "SET_CAJA_ACTIVA" , payload : { id_caja : null , estado : "cerrada"}});
            dispatch({type : "CERRAR_MODALES"});
        
           setTimeout(() => {  
             dispatch({type : "CERRAR_MODAL_ANIMACION" }); 
             dispatch({type : "RESET_MONTO_APERTURA_DETALLE" , payload : state.aperturaDetalle })  
             dispatch({type : "FORMATEAR_MOV_EXTRAORDINARIOS"});
             dispatch({ type : "RESET_MONTO_CUENTAS_CIERRE" , payload : state.metricasCuentasCierre});
           }, 2000);           
        };
        if (cierreCajaResult.code === "NO_HAY_CAJA_ABIERTA"){
           return dispatch({ type : "SET_ERROR" , payload : "No existe caja abierta"}); 
        }       

    }catch(error){
        dispatch({ type : "SET_ERROR" , payload : "Error en el servidor"});
    }finally{
        dispatch({ type : "FINALIZAR_OPERACION"}); 
    };
};
// ──────────────────────────────────────────────────────────────
// FUNCION para obtener el estado de caja cuando se renderiza caja , fallaba y esto es un parche
// ────────────────────────────────────────────────────────────── 

const sincronizarEstadoCaja = async () => {
   // if (!config?.id_escuela) return;
    try {
      const idCajaResult = await idCajaFuntion();
      if (idCajaResult) {
        dispatch({ type: "SET_CAJA_ACTIVA", payload: { id_caja: idCajaResult, estado: "abierta" } });
        // ... tus otros dispatch de éxito
      } else {
        dispatch({ type: "SET_CAJA_ACTIVA", payload: { id_caja: null, estado: "cerrada" } });
      }
    } catch (error) {
      console.error(error);
    }
  };


useEffect(() => {
    sincronizarEstadoCaja();
  }, []); // colocar un resfrescador 


// ──────────────────────────────────────────────────────────────
//Obtener id de caja
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const idCaja = async () => {
    
        const idCajaResult = await idCajaFuntion();
        
        if ( idCajaResult){
           
            dispatch({
                type : "SET_CAJA_ACTIVA",
                payload : {
                    id_caja : idCajaResult,
                    estado   : "abierta"
                }
            });

            dispatch({
                type : 'SET_ERROR' ,
                payload : null
            });

            dispatch({ type : "UPDATE_MOVIMIENTO_EXTRA" , payload : { campo : "id_caja" , valor : idCajaResult}});

        }else{ 
            dispatch({
                type : "SET_CAJA_ACTIVA",
                payload : {
                    id_caja : null,
                    estado   : "cerrada"
                }
            });
        };
    };
    idCaja();
},[]);  

    return {
        state,
        dispatch,

        handleAbrirCaja,
        handleCerrarCaja,
        handleEstadosCaja,
        cachearMontoIniciales,
        sincronizarEstadoCaja,
    };

};