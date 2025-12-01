//seccion componentes
import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";

// seccion de css
import "./buscador.css"

//seccion typado
/**
 * @typedef {Object} InputsPropsBuscador
 * @description Define la estructura esperada para la configuración de cada input dentro del buscador.
 * @property {string} [label] - Texto del label del input.
 * @property {'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'file'} [type] - Tipo de input HTML.
 * @property {string} [placeholder] - Texto placeholder del input.
 * @property {string | number} [value] - Valor actual del input.
 * @property {string} [name] - Atributo 'name' usado para identificar el input en el objeto de datos.
 * @property {string | null} [error] - Mensaje de error para mostrar bajo el input.
 */



export type InputsPropsBuscador = {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'file';
    placeholder?: string;
    value?: string | number;
    name?: string;
    error?: string | null;
}


/**
 * @typedef {Object} BuscadorProps
 * @description Propiedades que recibe el componente Buscadores para manejar filtros y acciones.
 * @property {function(React.ChangeEvent<HTMLInputElement>): void} [onChange] - Handler para cambios en los inputs de búsqueda.
 * @property {function(React.MouseEvent<HTMLButtonElement>): void} [onAgregar] - Handler para el clic en el botón "Agregar".
 * @property {function(React.ChangeEvent<HTMLSelectElement>): void} [onEstados] - Handler para cambios en el selector de estados/filtros.
 * @property {InputsPropsBuscador[]} intputBuscador - Array con la definición de los inputs a renderizar en el buscador.
 * @property {string} [tituloBuscador] - Título opcional a mostrar encima de la sección de búsqueda.
 * @property {Record<string, string | number>} [buscadorData] - Objeto con los valores actuales de los inputs de búsqueda, mapeado por su `name`.
 * @property {string} captionBoton - Texto a mostrar en el botón de acción (ej: "Agregar").
 * @property {string[]} estados - Array de strings para las opciones del selector de estado (ej: ["Activo", "Inactivo"]).
 */

interface BuscadorProps {
    onChange ?  : ( event : React.ChangeEvent<HTMLInputElement>) => void,
    onAgregar ? : ( event : React.MouseEvent<HTMLButtonElement>) => void,
    onEstados ? : ( event : React.ChangeEvent<HTMLSelectElement>) => void, 

    intputBuscador  : InputsPropsBuscador[],
    tituloBuscador ? : string,
    buscadorData ?   : Record<string, string | number>,
    captionBoton : string,
    estados : string[]
}

/**
 * @function Buscadores
 * @description Componente funcional que renderiza el área de búsqueda, filtrado por estado y la acción de agregar.
 * @param {BuscadorProps} parametros - Las propiedades que definen la configuración y los manejadores del buscador.
 * @returns {JSX.Element} La estructura JSX del buscador.
 */


export const Buscadores = ( parametros : BuscadorProps) =>{
return(
    <div className="buscador_contenedor_comp">
            <p className="buscador_titulo"> {parametros.tituloBuscador} </p>
            <div className="buscador_buscadores">
                {
                    parametros.intputBuscador.map( input =>{
                        return(
                            <Inputs
                                key={input.name}
                                label={input.label}
                                type={input.type}
                                name={input.name}
                                value={ parametros.buscadorData ? parametros.buscadorData[input.name ?? ""] : "" }
                                onChange={parametros.onChange}
                                placeholder={input.placeholder}
                                readonly = {false}
                            />
                        );
                    })
                }
            </div>

 

            <div className="buscador_boton">
                <Boton
                    texto={parametros.captionBoton}
                    logo="Add"
                    clase="aceptar"
                    onClick={parametros.onAgregar}
                />

                <select 
                    className="buscador_estado"
                    name="estado"

                    onChange={parametros.onEstados}
                >
                    {
                        parametros.estados.map((estado, index) => (
                            <option key={index} value={estado}>{estado}</option>
                        ))
                    }
                </select>

            </div>
    </div>
)

}