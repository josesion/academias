import React, { forwardRef } from 'react';
//Seccion Estilos
import "../Inputs/inputs.css";



/**
 * @typedef {Object} InputsProps - Propiedades del componente Inputs.
 * @property {string} [label] - El texto que se muestra como etiqueta para el campo de entrada.
 * @property {'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'file'} [type] - El tipo del campo de entrada.
 * @property {string} [placeholder] - El texto de marcador de posición dentro del campo.
 * @property {string | number} [value] - El valor actual del campo de entrada.
 * @property {string} [name] - El nombre del campo.
 * @property {boolean} readonly - **Indica si el campo debe ser de solo lectura**. (Agregado)
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} [onChange] - La función que se ejecuta cada vez que el valor del campo cambia.
 * @property {string | null} [error] - El mensaje de error a mostrar debajo del campo. Si no hay error, debe ser `null` o una cadena vacía.
 */
interface InputsProps {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'file' ;
    placeholder?: string;
    value?: string | number;
    name?: string;
    readonly : boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | null;
}

/**
 * Componente `Inputs` para crear un campo de entrada reutilizable.
 * **Utiliza `forwardRef`** para permitir que los componentes padre accedan al elemento 
 * DOM subyacente del input. Incluye una etiqueta y un espacio para mensajes de error.
 *
 * @param {InputsProps} parametros - Las propiedades del componente.
 * @param {React.Ref<HTMLInputElement>} ref - La referencia pasada por el componente padre.
 * @returns {JSX.Element} El elemento JSX del componente.
 */
export const Inputs = forwardRef<HTMLInputElement, InputsProps>((parametros, ref) => {

  // Genera un ID único para asociar la etiqueta con el input.
  // Utiliza el nombre, la etiqueta (limpiándola) o un ID aleatorio como fallback.
    const inputId = parametros.name || (parametros.label && parametros.label.toLowerCase().replace(/\s/g, '-')) || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Define valores por defecto si las propiedades no están presentes.
    const inputType = parametros.type || 'text';
    const inputPlaceholder = parametros.placeholder || 'Ingrese un valor';
    const inputLabel = parametros.label || 'Campo de entrada';

return (
    <div className="inputs_contenedor">
      {/* Etiqueta del campo de entrada. El atributo `htmlFor` la enlaza con el input a través del `inputId`. */}
        <label htmlFor={inputId}>{inputLabel}</label>
      {/* El campo de entrada principal. */}
        <input  
            ref={ref}
            type={inputType} 
            placeholder={inputPlaceholder}
            id={inputId}
            value={parametros.value}
            name={parametros.name}
            onChange={parametros.onChange} 
            className="inputs"
            readOnly = {parametros.readonly}
        />

      {/* Contenedor para el mensaje de error. Se muestra solo si la propiedad `error` tiene un valor. */}
        <div className="error_espacio">
            {parametros.error && <p className="mensaje_error">{parametros.error}</p>}
        </div>
    </div>
)}
);

