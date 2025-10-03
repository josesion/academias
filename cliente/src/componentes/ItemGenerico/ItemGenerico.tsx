

// Seccion de componentes
import { Boton } from "../../componentes/Boton/Boton";

//seccion de estilos
import "./itemGenerico.css";


/**
 * @typedef {Object} ItemGenericoProps - Propiedades del componente ItemGenerico.
 * @template T
 * @property {T} data - El objeto de datos a mostrar.
 * @property {(data: T) => void} [onEditarButton] - La función que se llama cuando se hace clic en el botón 'Editar'. Se pasa el objeto de datos completo.
 * @property {(data: T) => void} [onEliminarButton] - La función que se llama cuando se hace clic en el botón 'Eliminar'. Se pasa el objeto de datos completo.
 */
type ItemGenericoProps<T extends object> = {
    data: T;
    onEditarButton?: (data: T) => void;
    onEliminarButton?: (data: T) => void;
};

/**
 * Función auxiliar para capitalizar la primera letra de una cadena.
 * @param {string} s - La cadena a capitalizar.
 * @returns {string} La cadena con la primera letra en mayúscula o una cadena vacía si no es una cadena válida.
 */
const capitalize = (s: string): string => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Componente `ItemGenerico` para renderizar de manera dinámica los pares clave-valor de un objeto
 * y proporciona botones de "Editar" y "Eliminar".
 *
 * @param {ItemGenericoProps} { data, onEditarButton, onEliminarButton } - Las propiedades del componente.
 * @returns {JSX.Element} El elemento JSX del componente.
 *
 * @example
 * // Con un objeto de ejemplo:
 * const usuariosEjemplo = {
 * id: 1,
 * usuario: 'joses',
 * nombre_completo: 'José Sánchez',
 * };
 *
 * <ItemGenerico
 * data={usuariosEjemplo}
 * onEditarButton={(data) => console.log('Editar:', data)}
 * onEliminarButton={(data) => console.log('Eliminar:', data)}
 * />
 *
 * // El componente mostrará:
 * // ID: 1
 * // Usuario: joses
 * // Nombre_completo: José Sánchez
 * // Y los botones de Editar y Eliminar
 */
export function ItemGenerico<T extends object>({
    data,
    onEditarButton,
    onEliminarButton,
}: ItemGenericoProps<T>)  {

    return (
        <div className="item_generico">
            {
                // Mapea las entradas del objeto `data` (pares clave-valor).
                // La key del div es la clave del objeto para garantizar que cada elemento sea único en la lista.
                data && Object.entries(data).map(([key, value]) => {
                    let displayValue: string | number = "";

                    // Maneja valores nulos, indefinidos u objetos para evitar errores de renderizado.
                    if (value === null || value === undefined) {
                        displayValue = "";
                    } else if (typeof value === 'object') {
                        // Si el valor es un objeto, muestra un marcador de posición.
                        displayValue = "[Objeto]";
                    } else {// si pasa todas las validaciones recien asigna el valor de value
                        displayValue = value as string | number;
                    }

                    return (
                        <div key={key} className="item_generico_contenedor">
                            {/* Muestra la clave capitalizada y su valor. */}
                            <span className="item_generico_key">{capitalize(key)}:</span>
                            <span className="item_generico_value">{displayValue}</span>
                        </div>
                    );
                })
            }
            <div className="botonera_item_generico">
                {/* Botón para editar. Solo se renderiza si la función `onEditarButton` se pasa como prop. */}
                <Boton
                    texto="Editar"
                    logo="Edit"
                    size={20}
                    clase="editar"
                    onClick={() => onEditarButton && data && onEditarButton(data)}
                />
                {/* Botón para eliminar. Solo se renderiza si la función `onEliminarButton` se pasa como prop. */}
                <Boton
                    texto="Eliminar"
                    logo="Delete"
                    size={20}
                    clase="eliminar"
                    onClick={() => onEliminarButton && data && onEliminarButton(data)}
                />
            </div>

        </div>
    );
}