import React, { useId } from "react";
import PhoneInput from "react-phone-number-input";

// CSS de la librería para las banderas y estilos base
import "react-phone-number-input/style.css";

// Estilos personalizados del componente
import "./phoneInputField.css";

/**
 * @typedef {Object} PhoneInputFieldProps - Propiedades del componente PhoneInputField.
 * @property {string} [label] - El texto que se muestra como etiqueta para el campo.
 * @property {string} [value] - El valor actual del teléfono en formato E.164 (ej: +5491112345678).
 * @property {(value: string | undefined) => void} [onChange] - La función que se ejecuta cuando el valor cambia.
 * @property {string} [name] - El nombre del campo.
 * @property {boolean} [required] - Indica si el campo es obligatorio.
 * @property {boolean} [disabled] - Indica si el campo está deshabilitado.
 * @property {string | null} [error] - El mensaje de error a mostrar debajo del campo.
 * @property {string} [placeholder] - El texto de marcador de posición.
 * @property {'AR' | 'US' | 'BR' | 'MX' | 'CO' | 'PE' | 'CL' | 'UY' | 'EC' | string} [defaultCountry] - El código de país por defecto (default: 'AR').
 */
interface PhoneInputFieldProps {
  label?: string;
  value?: string | undefined;
  onChange?: (value: string | undefined) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  placeholder?: string;
  defaultCountry?: string;
}

/**
 * Componente `PhoneInputField` para ingresar números de teléfono con selector de país.
 * Usa `react-phone-number-input` para normalizar el número en formato E.164.
 *
 * @param {PhoneInputFieldProps} props - Las propiedades del componente.
 * @returns {JSX.Element} El elemento JSX del componente.
 */
export const PhoneInputField = (props: PhoneInputFieldProps) => {
  const idUnico = useId();

  const inputId =
    props.name ||
    (props.label && props.label.toLowerCase().replace(/\s/g, "-")) ||
    idUnico;

  const idError = `${inputId}_error`;
  const tieneError = Boolean(props.error);
  const esRequerido = Boolean(props.required);

  const defaultCountry = props.defaultCountry || "AR";

  return (
    <div className="phone_input_contenedor">
      {/* Etiqueta del campo */}
      <label htmlFor={inputId}>
        {props.label}
        {esRequerido && (
          <span className="phone_input_requerido" aria-hidden="true">*</span>
        )}
      </label>

      {/* Input de teléfono con selector de país */}
      <PhoneInput
        id={inputId}
        className="phone_input"
        placeholder={props.placeholder || "Ingrese un número de teléfono"}
        value={props.value}
        onChange={props.onChange}
        defaultCountry={defaultCountry}
        disabled={props.disabled}
        international={true}
        withCountryCallingCode={true}
        required={props.required}
        aria-invalid={tieneError ? true : undefined}
        aria-describedby={tieneError ? idError : undefined}
      />

      {/* Mensaje de error */}
      <div className="phone_input_error_espacio">
        {props.error && (
          <p className="phone_input_mensaje_error" id={idError} role="alert">
            {props.error}
          </p>
        )}
      </div>
    </div>
  );
};
