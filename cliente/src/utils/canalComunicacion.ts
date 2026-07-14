
interface DataCanal<T>{
    nombreCanal : string,
    data : {  type : string , info? : T }
    dispatchError :React.Dispatch<any>;
    dispatchActualizar?:React.Dispatch<any>;
    error : string,
    actualizar : string,
};


/**
 * Envía un mensaje a través de un canal de difusión (BroadcastChannel) hacia otras pestañas.
 * * @template T - El tipo de dato esperado en la información (payload).
 * @param {DataCanal<T>} data - Configuración del canal, incluyendo el nombre, los datos a enviar y los dispatchers para errores.
 */
export const peticionComunicacion =  <T> ( data : DataCanal<T>) => {
    try {
        const canalComunicacion = new BroadcastChannel( data.nombreCanal );
        canalComunicacion.postMessage( data.data );        
    } catch (error) {
        data.dispatchError({ 
            type: data.error, 
            payload: "Error al establecer conexión con el canal" 
        });
    }
};

/**
 * Escucha mensajes en un canal de difusión y dispara una acción en el reducer si coincide el tipo.
 * * @template T - El tipo de dato esperado en la información (payload).
 * @param {DataCanal<T>} data - Configuración del canal, nombre, tipo de mensaje esperado, y dispatchers de estado.
 * @returns {() => void} Una función de limpieza que cierra el canal para evitar fugas de memoria.
 */
export const recepcionComunicacion = <T>(data: DataCanal<T>) => {
    try {
        const canalComunicacion = new BroadcastChannel(data.nombreCanal);

        canalComunicacion.onmessage = (event) => {
            // ¡IMPORTANTE!: Comparamos event.data.type
            if (event.data.type === data.data.type && data.dispatchActualizar) {
                // Ejecutamos el dispatch con los datos recibidos (event.data.info)
                data.dispatchActualizar({  type: data.actualizar });
            };
        };

        return () => canalComunicacion.close();

    } catch (error) {
     
        data.dispatchError({ 
            type: data.error, 
            payload: "Error al establecer conexión con el canal" 
        });
    }
};