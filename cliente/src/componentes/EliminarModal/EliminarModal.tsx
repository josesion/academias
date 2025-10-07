import { Boton } from "../Boton/Boton";
import { CompoError } from "../Error/Error";

import "./eliminarModal.css";

type ComponenteEliminar<T extends object> = {
    data : T
    onSi ? : ( data : T) => void; 
    onCancelar ? : ( ) => void;
    accion : string,
    mensaje?: string | null
}

export function EliminarVentana<T extends object> ( {
    data,
    onSi,
    onCancelar,
    accion , 
    mensaje  
} : ComponenteEliminar<T> ) { 
    return(
        <div className="componente_eliminar">
            <div className="datos_eliminar">
                    <p> Estas seguro de </p>
                    <p> {accion} </p>
            </div>
            <div className="botonera_eliminar">
                <Boton
                    texto="Si"
                    logo="Delete"
                    size={20}
                    clase="eliminar"
                    onClick={() => onSi && data && onSi(data)}
                    focus ={true}
                />

                <Boton
                    texto="No"
                    logo="Cancel"
                    size={20}
                    clase="editar"
                    onClick={ onCancelar }
                />

            </div>

            { mensaje &&  <CompoError mensaje={mensaje}/> }

        </div>
    )
}