import { useRef , useEffect} from "react";
// Seccion de componentes
import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";
import { CompoError } from "../Error/Error";
// Seccion de estilos
import "./formularios.css";
import "../Boton/boton.css"
// Seccion de tipados

/**
 * @typedef {Object} InputsPropsFormulario - Propiedades de un input individual dentro del formulario.
 * @property {string} [label] - Texto de la etiqueta del input.
 * @property {'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'file'} [type='text'] - El tipo del input. Por defecto es 'text'.
 * @property {string} [placeholder] - El texto de marcador de posición del input.
 * @property {string | number} [value] - El valor del input.
 * @property {string} [name] - El nombre del input. Este es crucial para identificar el campo.
 * @property {string | null} [error] - Mensaje de error específico para este input.
 */
export type InputsPropsFormulario = {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'file';
    placeholder?: string;
    value?: string | number;
    name?: string;
    error?: string | null;
    readonly : boolean;
}

/**
 * @typedef {Object} FormularioProps - Propiedades del componente Formulario.
 * @property {InputsPropsFormulario[]} data - Un array de objetos que describe cada input que se debe renderizar.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} [onChange] - La función de callback que se ejecuta cuando el valor de cualquier input cambia.
 * @property {(event: React.FormEvent<HTMLFormElement>) => void} onSubmit - La función de callback que se ejecuta cuando el formulario se envía.
 * @property {(event: React.MouseEvent<HTMLButtonElement>) => void} [onCancelar] - La función de callback que se ejecuta cuando se hace clic en el botón 'Cancelar'.
 * @property {Record<string, string | number>} [formData] - Un objeto que contiene los valores del formulario, permitiendo que el formulario sea controlado.
 * @property {Record<string, string | null>} [errorsZod] - Un objeto con los mensajes de error específicos para cada input (ej. validación con Zod).
 * @property {string | null} [errorGenerico] - Un mensaje de error general que se muestra en la parte inferior del formulario.
 * @property {string} tituloFormulario - El título que se mostrará en la parte superior del formulario.
 */
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

/**
 * `Formulario` es un componente reutilizable y dinámico para crear formularios de manera flexible.
 *
 * Utiliza un array de objetos en el prop `data` para generar automáticamente los campos de entrada (`Inputs`).
 * Maneja la lógica de envío (`onSubmit`) y cambio de valores (`onChange`) a través de las funciones de callback que se le pasan.
 *
 * También es capaz de mostrar mensajes de error específicos por campo (`errorsZod`) y un error genérico para todo el formulario (`errorGenerico`).
 *
 * @param {FormularioProps} props - Las propiedades del componente.
 * @returns {JSX.Element} El elemento JSX del componente.
 *
 * @example
 * // Con un formulario de registro de usuario:
 * const inputsRegistro = [
 * { name: 'email', label: 'Correo Electrónico', type: 'email', placeholder: 'ejemplo@correo.com' },
 * { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Ingresa tu contraseña' },
 * ];
 *
 * const handleSubmit = (e) => {
 * e.preventDefault();
 * console.log('Formulario enviado');
 * };
 *
 * const handleChange = (e) => {
 * console.log(`${e.target.name}: ${e.target.value}`);
 * };
 *
 * <Formulario
 * tituloFormulario="Registro de Usuario"
 * data={inputsRegistro}
 * onSubmit={handleSubmit}
 * onChange={handleChange}
 * />
 *
 * // El componente renderizará un formulario con un campo de correo y uno de contraseña.
 */
export const Formulario = (props: FormularioProps) => {
    // Crea la referencia para el primer input.
    const primerInputRef = useRef<HTMLInputElement>(null);

    // Aplica el foco una vez que el componente se ha renderizado.
    useEffect(() => {
        if (primerInputRef.current) {
            primerInputRef.current.focus();
        }
    }, []); // El array vacío asegura que solo se ejecute una vez al montar.

    return (
        <form className="formulario" onSubmit={props.onSubmit}>
            <p className="formulario_titulo">{props.tituloFormulario}</p>
            {
                props.data.map( (input, index) => {
                    return (
                        <Inputs
                            key={input.name}
                            ref = {index === 0 ? primerInputRef : null}
                            label={input.label}
                            type={input.type}
                            placeholder={input.placeholder}
                            name={input.name}
                            value={props.formData ? props.formData[input.name ?? ""] : ""}
                            onChange={props.onChange}
                            readonly = {input.readonly}
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
    );
}