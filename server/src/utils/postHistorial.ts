import { method as servicioHistorial} from "../Servicio/historial.servicio";
import { type HistorialInputs } from "../squemas/historial";


/**
 * Registra una acción en el historial del sistema.
 *
 * Intenta guardar el evento en la tabla de historial. Si el registro falla,
 * no interrumpe el flujo principal de la aplicación; únicamente registra el
 * error en la consola para facilitar su diagnóstico.
 *
 * @param {HistorialInputs} data - Información de la acción realizada, incluyendo
 * el módulo, la acción, el usuario, la escuela y los datos asociados al evento.
 *
 * @returns {Promise<void>} Promesa que finaliza cuando se intenta registrar el historial.
 */
export const registroHistorial =async ( data : HistorialInputs): Promise<void> =>{

    const historial = await  servicioHistorial.postHistorialServicio( data );

    if ( historial.code !== "HISTORIAL_OK" ) {
       console.error(`Error registrando historial [${data.modulo} - ${data.accion}]`,historial.message);
    };  

};