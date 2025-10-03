// seccion de Bibliotecas


// seccio de componentes
import { ItemGenerico } from "../ItemGenerico/ItemGenerico";
import { ComponenteCargando } from "../Cargando/Cargando";
import { SinResultado } from "../SinItemsListado/SinResultado";
// seccion de estilos
import "./listaMolde.css";

/**
 * @typedef {Object} ListadoMoldeProps - Propiedades del componente ListadoMolde.
 * @template T
 * @property {T[]} items - Un array de objetos, donde cada objeto representa un ítem en la lista. Este es el único prop obligatorio.
 * @property {(data: T) => void} [onEditar] - La función de callback que se ejecuta cuando se hace clic en el botón 'Editar' de un ítem. Recibe el objeto de datos completo del ítem.
 * @property {(data: T) => void} [onEliminar] - La función de callback que se ejecuta cuando se hace clic en el botón 'Eliminar' de un ítem. Recibe el objeto de datos completo del ítem.
 */
type ListadoMoldeProps<T extends object> = {
    items: T[];
    carga : boolean;
    statusCode : number ;
    error : boolean
    onEditar?: (data: T) => void;
    onEliminar?: (data: T) => void;
};

export function ListadoMolde<T extends object>({
    items,
    carga,
    error,
    statusCode,
    onEditar,
    onEliminar,
}: ListadoMoldeProps<T>) {
    return (
        <div className="listado_molde">
            {
                carga === true ? <ComponenteCargando /> 

                : statusCode === 200 && error === true ?  <SinResultado />
                
                :items.map((item, idx) => {
                    // Usa id si existe, si no usa el índice
                    const key =
                        typeof (item as any).id === "string" || typeof (item as any).id === "number"
                            ? (item as any).id
                            : idx;
                    return (
                        <ItemGenerico
                            key={key}
                            data={item}
                            onEditarButton={onEditar}
                            onEliminarButton={onEliminar}
                        />
                    )
                })




            }


        </div>
    );
}