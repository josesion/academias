//seccion componentes
import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";

// seccion de css
import "./buscador.css"

//seccion typado
export type InputsPropsBuscador = {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'file';
    placeholder?: string;
    value?: string | number;
    name?: string;
    error?: string | null;
}

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



export const Buscadores = ( parametros : BuscadorProps) =>{
return(
    <div className="buscador_contenedor">
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
                            />
                        );
                    })
                }
            </div>

 

            <div className="buscador_boton">
                <Boton
                    texto={parametros.captionBoton}
                    logo="Add"
                    clase="agregar"
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