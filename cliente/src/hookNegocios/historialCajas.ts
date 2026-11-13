
import {  useListaCajaBase } from "../hooks/ListadoCajas/ListadoCajasBase";
import { estadoHistoriaCajas, 
         historialCajas,
         usuariosEscuelas,  
         detalleCajaResumen,     
 } from "../servicio/historial.cajas.fetch";


export const setHistorialCajas = () =>{

    const config = {
        servicios : {
            estadoEncabezado : estadoHistoriaCajas,
            historialCajas : historialCajas,
            usuariosEscuela : usuariosEscuelas,
            detalleCajaResumen : detalleCajaResumen
        },
    }

    return useListaCajaBase( config );

};