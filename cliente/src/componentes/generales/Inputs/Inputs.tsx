import React, { forwardRef, useId } from "react";
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
  type?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "date"
    | "checkbox"
    | "radio"
    | "file"
    | "tel";
  placeholder?: string;
  value?: string | number;
  name?: string;
  readonly: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  autoComplete?: string;
  // Password toggle (opcional) - solo aplica si type="password"
  showPasswordToggle?: boolean;
  // Callback cuando cambia la visibilidad (opcional)
  onPasswordToggle?: (visible: boolean) => void;
  // Filtro de archivos del input type=file (spec 017). Aditiva: sin esta prop
  // el input se comporta exactamente como antes.
  accept?: string;
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
export const Inputs = forwardRef<HTMLInputElement, InputsProps>(
  (parametros, ref) => {
    // Genera un ID único para asociar la etiqueta con el input.
    const idUnico = useId();

    const inputId =
      parametros.name ||
      (parametros.label &&
        parametros.label.toLowerCase().replace(/\s/g, "-")) ||
      idUnico;

    // El aviso de error se anuncia al lector de voz: el input lo referencia con
    // `aria-describedby` y se marca como inválido (spec 016).
    const idError = `${inputId}_error`;
    const tieneError = Boolean(parametros.error);

    // Define valores por defecto si las propiedades no están presentes.
    const inputType = parametros.type || "text";
    const inputPlaceholder = parametros.placeholder || "Ingrese un valor";
    const inputLabel = parametros.label;
    const esRequerido = Boolean(parametros.required);

    // Password toggle state (solo si type="password" y showPasswordToggle=true)
    const esPassword = inputType === "password" && parametros.showPasswordToggle === true;
    const [mostrarPassword, setMostrarPassword] = React.useState(false);
    const tipoEfectivo = esPassword && mostrarPassword ? "text" : inputType;

    const togglePassword = () => {
      const nuevoEstado = !mostrarPassword;
      setMostrarPassword(nuevoEstado);
      parametros.onPasswordToggle?.(nuevoEstado);
    };

    return (
      <div className="inputs_contenedor">
        {/* Etiqueta del campo de entrada. El atributo `htmlFor` la enlaza con el input a través del `inputId`. */}
        <label htmlFor={inputId}>
          {inputLabel}
          {esRequerido && (
            <span className="inputs_requerido" aria-hidden="true">*</span>
          )}
        </label>
        {/* El campo de entrada principal + toggle password (si aplica) */}
        <div className="inputs_wrapper" style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            ref={ref}
            type={tipoEfectivo}
            placeholder={inputPlaceholder}
            id={inputId}
            value={parametros.value}
            name={parametros.name}
            onChange={parametros.onChange}
            className="inputs"
            readOnly={parametros.readonly}
            required={parametros.required}
            disabled={parametros.disabled}
            autoComplete={parametros.autoComplete}
            // Solo tiene efecto con type=file (spec 017): filtra el diálogo de
            // archivos que abre el navegador. No previene que se suba otra cosa,
            // eso lo valida el server.
            accept={parametros.accept}
            aria-invalid={tieneError ? true : undefined}
            aria-describedby={tieneError ? idError : undefined}
            style={esPassword ? { paddingRight: "44px" } : undefined}
          />
          {esPassword && (
            <button
              type="button"
              className="inputs_toggle_password"
              onClick={togglePassword}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={mostrarPassword}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--texto-secundario)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Ojo ABIERTO = contraseña VISIBLE (type="text") */}
              {mostrarPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Contenedor para el mensaje de error. Se muestra solo si la propiedad `error` tiene un valor.
            role="alert" anuncia el error inmediatamente a lectores de pantalla (WCAG 2.1 AA). */}
        <div className="error_espacio">
          {parametros.error && (
            <p className="mensaje_error" id={idError} role="alert">
              {parametros.error}
            </p>
          )}
        </div>
      </div>
    );
  },
);
