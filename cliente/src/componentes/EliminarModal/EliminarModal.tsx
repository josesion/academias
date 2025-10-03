import { Boton } from "../Boton/Boton";

import "./eliminarModal.css";

type ComponenteEliminar<T extends object> = {
    data : T
    onSi ? : ( data : T) => void; 
}

export function EliminarVentana<T extends object> ( {
    data,
    onSi    
} : ComponenteEliminar<T> ) { 
    return(
        <div className="componente_eliminar">
            <div className="datos_eliminar">
                    <p> Estas seguro de  </p>
            </div>
            <div className="botonera_eliminar">
                <Boton
                    texto="Si"
                    logo="Delete"
                    size={20}
                    clase="eliminar"
                    onClick={() => onSi && data && onSi(data)}
                />

                <Boton
                    texto="No"
                    logo="Cancel"
                    size={20}
                    clase="editar"
                    onClick={() => onSi && data && onSi(data)}
                />

            </div>
        </div>
    )
}