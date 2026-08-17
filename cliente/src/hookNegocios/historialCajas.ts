
import {  useListaCajaBase } from "../hooks/ListadoCajas/ListadoCajasBase";
import { estadoHistoriaCajas, historialCajas } from "../servicio/historial.cajas.fetch";


export const setHistorialCajas = () =>{

    const config = {

        servicios : {
            estadoEncabezado : estadoHistoriaCajas,
            historialCajas : historialCajas
        },
    }

    return useListaCajaBase( config );

};