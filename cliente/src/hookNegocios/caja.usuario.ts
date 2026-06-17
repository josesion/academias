import { useContext } from "react";


//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";
import { useCajaUsuario } from "../hooks/caja/caja.usuarios";
//Seccion de servicios--------------------------------------
import { metricasPanelCaja, obtenerIdCaja , abrirCaja , 
         cerrarCaja , movimientoCajaDetalle, listadoCategoriaCaja,
         registrarMovimientoCaja,  listadoTipoCuentas,
         metricasPanelPrincipal,
        } from "../servicio/caja.fetch";

export const  cajasCongif = () =>{
    
    const { rol } = useContext( RutasProtegidasContext ); 
    
    const config = {

        usuario : rol?.usuario  as string,
        servicios : {
            obtenerIdCaja     : obtenerIdCaja,
            metricasPanelCaja : metricasPanelCaja,
            metricasPanelPrincipal : metricasPanelPrincipal,
            abrirCaja         : abrirCaja,
            cerrarCaja        : cerrarCaja,
            movimientoCajaDetalle : movimientoCajaDetalle,
            listadoCategoriaCaja  : listadoCategoriaCaja,
            registrarMovimientoCaja : registrarMovimientoCaja,
            listadoTipoCuentas : listadoTipoCuentas
        }  
    };
    return useCajaUsuario(config)    
};