import { useContext } from "react";


//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";
import { useCajaUsuario } from "../hooks/caja.usuarios";
//Seccion de servicios--------------------------------------
import { metricasPanelCaja, obtenerIdCaja , abrirCaja , cerrarCaja} from "../servicio/caja.fetch";

export const  cajasCongif = () =>{
    const { rol } = useContext( RutasProtegidasContext ); 
    
    const config = {
        id_escuela :rol?.escuela || 1 ,  
        servicios : {
            obtenerIdCaja     : obtenerIdCaja,
            metricasPanelCaja : metricasPanelCaja,
            abrirCaja         : abrirCaja,
            cerrarCaja        : cerrarCaja
        }  
    };
    return useCajaUsuario(config)    
};