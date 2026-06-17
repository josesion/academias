

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

import { useCajaBase } from "./useCajaBase";
import { useCajaMovimientos } from "./useCajaMovimientos";
import { useCajaMetricas } from "./useCajaMetricas";
import { useEntidadesExternasCaja } from "./useEntidadesExternasCaja";
import { useIuCaja } from "./useIUCaja";

interface DataCajaUsuariosConfig {

    usuario    : string,
    
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

    // ─────────────────────────────
    // CORE CAJA
    // ─────────────────────────────

    const cajaBase = useCajaBase({

        usuario    : config.usuario,

        servicios : {
            abrirCaja  : config.servicios.abrirCaja,
            cerrarCaja : config.servicios.cerrarCaja,
            obtenerIdCaja : config.servicios.obtenerIdCaja
        },
    });

    // ─────────────────────────────
    // MÉTRICAS
    // ─────────────────────────────

    const cajaMetricas = useCajaMetricas({
        servicios : {
            metricasPanelCaja : config.servicios.metricasPanelCaja,
            movimientoCajaDetalle : config.servicios.movimientoCajaDetalle,
            metricasPanelPrincipal : config.servicios.metricasPanelPrincipal,
        },
        state : cajaBase.state,
        dispatch : cajaBase.dispatch
    });

    // ─────────────────────────────
    // MOVIMIENTOS
    // ─────────────────────────────
    const cajaMovimientos = useCajaMovimientos({
        servicios : {
            movimientoCajaDetalle : config.servicios.movimientoCajaDetalle,
            registrarMovimientoCaja : config.servicios.registrarMovimientoCaja,
        },
        state : cajaBase.state,
        dispatch : cajaBase.dispatch
    });

  
    // ─────────────────────────────
    // LISTADOS EXTRAORDIANRIOS 
    // ─────────────────────────────  
    const entidadesExternasCaja = useEntidadesExternasCaja({
        servicios : { listadoTipoCuentas : config.servicios.listadoTipoCuentas },
        state : cajaBase.state,
        dispatch : cajaBase.dispatch
    });

    // ─────────────────────────────
    // MODALES SETEOS APERTURAS Y CIERRES
    // ─────────────────────────────    
    const moladesIU = useIuCaja({
        servicios : { listadoCategoriaCaja : config.servicios.listadoCategoriaCaja},
        state : cajaBase.state,
        dispatch : cajaBase.dispatch      
    });

    // ─────────────────────────────
    // RETORNO FINAL
    // ─────────────────────────────

    return{
        state : cajaBase.state,
        sincronizarEstadoCaja : cajaBase.sincronizarEstadoCaja,
        handleAbrirCaja : cajaBase.handleAbrirCaja,
        handleCerrarCaja : cajaBase.handleCerrarCaja,
        handleEstadosCaja : cajaBase.handleEstadosCaja,
        cachearMontoIniciales : cajaBase.cachearMontoIniciales,

        lastElementRef : cajaMovimientos.lastElementRef,
        movimientos : cajaMovimientos.movimientos,
        scrollState : cajaMovimientos.scrollState,

        handleMovimientoExtraordinarioChange : cajaMovimientos.handleMovimientoExtraordinarioChange,
        handleTipoPagoChange : cajaMovimientos.handleTipoPagoChange,
        handleCerrarModalEgrIng : cajaMovimientos.handleCerrarModalEgrIng,
        handRegistarMovimientoExtraordinario : cajaMovimientos.handRegistarMovimientoExtraordinario,
        handleMontoChange : cajaMovimientos.handleMontoChange,
        handleMemoChange : cajaMovimientos.handleMemoChange,
        hanldeObsevacionesCierre : cajaMovimientos.hanldeObsevacionesCierre,
        
        handleAbrirEgreso : moladesIU.handleAbrirEgreso,
        hanldeCerrarInforme : moladesIU.hanldeCerrarInforme,
        handleAbrirCajaModalCerrar : moladesIU.handleAbrirCajaModalCerrar,
        handleCerrarModalCerrar : moladesIU.handleCerrarModalCerrar,
        handleCierreMontos : moladesIU.handleCierreMontos,
        handleAbrirIngreso : moladesIU.handleAbrirIngreso,
        handleCachearDetalle : moladesIU.handleCachearDetalle,       
    };


  
};    
