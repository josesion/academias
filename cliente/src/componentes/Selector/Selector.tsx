import './selector.css'



interface PropSelector {
     onChange ?  : ( event : React.ChangeEvent<HTMLInputElement>) => void, 
     objetoListado : any[],
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
 * Componente reutilizable que renderiza un input con un datalist (selector desplegable)
 * con soporte para diferentes estructuras de datos (planes, alumnos, etc.).
 * 
 * Permite parametrizar:
 *  - El nombre del datalist
 *  - La clave del valor que devolverá el input
 *  - Claves alternativas para mostrar información adicional en las opciones
 *  - El tipo de input (text o number)
 *
 * @component
 * 
 * @param {Object} parametros - Propiedades del componente.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} [parametros.onChange]
 *        Función que se ejecuta cada vez que el usuario escribe o selecciona un valor.
 *
 * @param {Array<Object>} parametros.objetoListado
 *        Lista de objetos que se usarán para generar las opciones del datalist.
 *        Cada objeto puede contener las claves `valueKey` y, opcionalmente, nombre/apellido/dni
 *        para mostrar etiquetas combinadas.
 *
 * @param {string} parametros.titulo
 *        Título visible arriba del selector.
 *
 * @param {string} parametros.input_list
 *        ID del datalist y referencia usada por el input para vincularse.
 *
 * @param {string} parametros.valueKey
 *        Clave del objeto dentro de `objetoListado` cuyo valor se usará como `value` del option.
 *
 * @param {string} [parametros.displayKey]
 *        Si es `"persona"`, mostrará `nombre apellido (dni)` como etiqueta visible en el dropdown.
 *
 * @param {"text" | "number"} parametros.tipo
 *        Tipo de input (texto o numérico).
 *
 * @returns {JSX.Element}
 *        Renderiza un input con estilo + datalist con las opciones generadas dinámicamente.
 */


export const SelectorPlegable = ( parametros : PropSelector) =>{


    return(
        <div className="caja_contenedor">  
         
            <p>{parametros.titulo}</p>

            <input 
                list={parametros.input_list}// sirve para enlasar el input con datalist
                id={parametros.input_list + "-input"} // ID única para accesibilidad
                name={parametros.name}
                placeholder={`Empieza a escribir el ${parametros.valueKey}...`}
                onChange={parametros.onChange}
                type={parametros.tipo}
            ></input>


            <datalist 
                id={parametros.input_list}// sirve para enlasar el input con datalist
                className="selector_contenedor"
               > 
               {
                    parametros.objetoListado.map( (item , index) => {

                            let valueToReturn = item[parametros.valueKey];
                            let displayLabel = valueToReturn;
                        // capturo el el valor q tenga el input y determino la propiedad 
                        // ej: {id : 1 , plan :"plan normal"} 
                        // si valueKey es plan  pasara al input el plan 
                         valueToReturn = item[parametros.valueKey]; 
                        // al mismo tiempo coloco el valor dentro de la variable
                        // para mostrar al cliente
                         displayLabel = valueToReturn; 
                        // veerifico q la llame es persona, para mostrar las propiedades del mismo
                        if (parametros.displayKey === "persona" && item.Nombre && item.Apellido) {
                            valueToReturn = item.Dni;
                            displayLabel = `${item.Nombre} ${item.Apellido}  `;
                        }

                        return(
                            <option 
                                className="selector_item"
                                key={item.id  || index } 
                                value={valueToReturn}>{ displayLabel }
                            </option>
                        )
                    })
               }
            </datalist>
        </div>
    )
};