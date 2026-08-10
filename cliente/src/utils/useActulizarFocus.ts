import { useEffect, useContext } from 'react';
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

import { RutasProtegidasContext } from "../contexto/protectRutas";

interface PropsActualizarFocus {
/** Función dispatch del reducer para actualizar el estado */    
    dispatchActualizar : React.Dispatch<any>;
/** Nombre de la acción que se disparará al cumplirse el foco y la validación */    
    accion : string
};

/**
 * Hook personalizado que escucha el evento "focus" de la ventana para mantener 
 * la aplicación sincronizada y segura.
 * 
 * Al recuperar el foco, realiza de manera asíncrona una verificación de autenticación:
 * - Si la sesión es inválida o expiró, redirige automáticamente al usuario al login.
 * - Si el usuario está autenticado, dispara la acción especificada para refrescar los datos.
 * 
 * @param {PropsActualizarFocus} props - Objeto de configuración con el dispatch y la acción.
 * 
 * @example
 * useActualizarAlEnfocar({ 
 *     dispatchActualizar: dispatch, 
 *     accion: "SET_ACTUALIZAR_GENERICO" 
 * });
 */
export const useActualizarAlEnfocar = ( props : PropsActualizarFocus) => {
    const { dispatchActualizar, accion} = props;    
    const { setRol } = useContext(RutasProtegidasContext);
 
    useEffect(() => {
        const handleFocus = async() => {

            const verificarUser= await verificarAutenticacion();
            if (verificarUser.autenticado === false) {
                setRol({rol : "visita", usuario :  "", razon_social  : ""});
                window.location.href = "/login" // por defecto en esta app es login
                return;
            };
           
            dispatchActualizar({ type: accion });
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, []);
};