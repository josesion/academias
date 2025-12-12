import './selector.css'

/**
 * SelectorPlegable
 * -----------------
 * Componente genérico que renderiza un input con un `<datalist>`, permitiendo
 * seleccionar elementos desde una lista dinámica de objetos.
 *
 * Este componente está pensado para ser flexible: recibe un array de cualquier
 * tipo de objeto (`T`) y permite elegir qué propiedad usar como valor del `<option>`
 * y cuál mostrar como texto.
 *
 * Soporta además un modo especial para entidades tipo "persona", mostrando:
 *      "Nombre Apellido"
 * y usando el DNI como value del option.
 *
 * @template T
 *
 * @param {Object} parametros - Propiedades del componente.
 *
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} [parametros.onChange]
 *     Callback ejecutado cuando cambia el valor del input.
 *
 * @param {T[]} parametros.objetoListado
 *     Lista de objetos que serán convertidos en `<option>`.
 *
 * @param {string} parametros.titulo
 *     Título visible del selector.
 *
 * @param {string} parametros.name
 *     Nombre del input (propiedad `name` del `<input>`).
 *
 * @param {string} parametros.input_list
 *     ID usado para vincular el `<input>` con el `<datalist>`.
 *
 * @param {string} parametros.valueKey
 *     Nombre de la propiedad del objeto que se usará como `value` del `<option>`.
 *
 * @param {string} [parametros.displayKey]
 *     Si es `"persona"` mostrará `"Nombre Apellido"` como etiqueta del option.
 *
 * @param {"text" | "number"} parametros.tipo
 *     Tipo del input.
 *
 * @returns {JSX.Element}
 *     Devuelve un input con datalist generado dinámicamente según el listado recibido.
 */

interface PropSelector<T> {
     onChange ?  : ( event : React.ChangeEvent<HTMLInputElement>) => void, 
     objetoListado : T[],
     titulo : string,
     name : string,
     input_list : string,
     valueKey: string,
     displayKey?: string, // este sirve para separar entre entidaddes q tengan id y personas q tengan nombre apellido
     tipo : "text" | "number" 
}; 


/**
 * SelectorPlegable
 * -----------------
 * Componente genérico que renderiza un `<input>` asociado a un `<datalist>`,
 * permitiendo seleccionar valores desde una lista filtrable.
 *
 * Este componente es reutilizable para distintos tipos de entidades gracias
 * al uso de genéricos (`<T>`). La clave del valor que se devolverá al input
 * se obtiene dinámicamente mediante `valueKey`, mientras que el texto visible
 * puede personalizarse con `displayKey`.
 *
 * Casos típicos de uso:
 *  - Listado de planes (valueKey = "descripcion")
 *  - Listado de alumnos (valueKey = "dni", displayKey = "persona")
 *
 * @template T
 * @component
 *
 * @param {Object} parametros - Propiedades del componente.
 *
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} [parametros.onChange]
 *        Función ejecutada cuando el usuario escribe o selecciona una opción.
 *
 * @param {T[]} parametros.objetoListado
 *        Lista de objetos que se mostrarán en las opciones del datalist.
 *
 * @param {string} parametros.titulo
 *        Texto visible sobre el selector.
 *
 * @param {string} parametros.name
 *        Nombre del input (atributo HTML `name`).
 *
 * @param {string} parametros.input_list
 *        ID del datalist, también usado por el input para vincularse.
 *
 * @param {string} parametros.valueKey
 *        Nombre de la propiedad dentro del objeto `T` que se usará como valor (`value`) del option.
 *
 * @param {string} [parametros.displayKey]
 *        Clave especial para mostrar etiquetas personalizadas.  
 *        Si es `"persona"`, mostrará `Nombre Apellido`.
 *
 * @param {"text" | "number"} parametros.tipo
 *        Tipo del input (texto o número).
 *
 * @returns {JSX.Element}
 *        Devuelve un selector completo (input + datalist).
 */


export const SelectorPlegable = <T,>(parametros: PropSelector<T>) => {
    return (
        <div className="caja_contenedor">  
            <p>{parametros.titulo}</p>

            <input 
                list={parametros.input_list}
                id={parametros.input_list + "-input"}
                name={parametros.name}
                placeholder={`Empieza a escribir el ${parametros.valueKey}...`}
                onChange={parametros.onChange}
                type={parametros.tipo}
            />

            <datalist id={parametros.input_list} className="selector_contenedor">
                {parametros.objetoListado.map((item: T, index) => {
                    
                    let valueToReturn: any = (item as any)[parametros.valueKey];
                    let displayLabel: any = valueToReturn;

                    if (
                        parametros.displayKey === "persona" &&
                        (item as any).Nombre &&
                        (item as any).Apellido
                    ) {
                        valueToReturn = (item as any).Dni;
                        displayLabel = `${(item as any).Nombre} ${(item as any).Apellido}`;
                    }

                    return (
                        <option
                            className="selector_item"
                            key={(item as any).id || index}
                            value={valueToReturn}
                        >
                            {displayLabel}
                        </option>
                    );
                })}
            </datalist>
        </div>
    );
};
