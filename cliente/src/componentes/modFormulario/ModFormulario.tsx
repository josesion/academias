// Seccion de componentes
import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";
import { CompoError } from "../Error/Error";
// Seccion de estilos
import "./formularios.css";
import "../Boton/boton.css";

// Seccion de tipados
export type InputsPropsFormulario = {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'file';
    placeholder?: string;
    value?: string | number;
    name?: string;
    error?: string | null;
}


interface FormularioProps {
    data: InputsPropsFormulario[],
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancelar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    formData?: Record<string, string | number>;
    errorsZod?: Record<string, string | null>;
    errorGenerico?: string | null;
    tituloFormulario: string;
    textoSubmit: string;
}

export const ModAlumnos = (props: FormularioProps) => {

    return(
        <form className="formulario" onSubmit={props.onSubmit}>
            <p className="formulario_titulo">{props.tituloFormulario}</p>
            {
                props.data.map(input => {
                    return (
                        <Inputs
                            key={input.name}
                            label={input.label}
                            type={input.type}
                            placeholder={input.placeholder}
                            name={input.name}
                            value={props.formData ? props.formData[input.name ?? ""] : ""}
                            onChange={props.onChange}

                            error={props.errorsZod && input.name ? props.errorsZod[input.name] : undefined}

                        />
                    );
                })
            }
            <div className="botonera_formulario">
                <Boton
                    texto={props.textoSubmit}
                    logo="Check"
                    size={25}
                    clase="aceptar"
                />
                <Boton
                    texto="Cancelar"
                    logo="Cancel"
                    size={25}
                    clase="flechas"
                    onClick={props.onCancelar}
                />
            </div>

            <div className="errores_genericos">
                {
                    props.errorGenerico && <CompoError mensaje={props.errorGenerico} />
                }
            </div>

        </form>
    )
}