import { useRef, useEffect } from "react";
// Seccion de componentes
import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";
import { CompoError } from "../Error/Error";
// Seccion de estilos
import "./formularios.css";
import "../Boton/boton.css";

export type InputsPropsFormulario = {
  label?: string;
  type?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "date"
    | "checkbox"
    | "radio"
    | "file";
  placeholder?: string;
  value?: string | number;
  name?: string;
  error?: string | null;
  readonly: boolean;
  options?: string[];
};

interface FormularioProps {
  data: InputsPropsFormulario[];
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancelar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onItemsFormulario?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  formData?: Record<string, string | number>;
  errorsZod?: Record<string, string | null>;
  errorGenerico?: string | null;
  tituloFormulario: string;
  textoSubmit: string;
}

export const Formulario = (props: FormularioProps) => {
  const primerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (primerInputRef.current) {
      primerInputRef.current.focus();
    }
  }, []);

  return (
    <form className="formulario" onSubmit={props.onSubmit}>
      <div className="formulario_titulo_container">
        <p className="formulario_titulo">{props.tituloFormulario}</p>

        {/* Partículas animadas */}
        <span className="particula_titulo tp-1"></span>
        <span className="particula_titulo tp-2"></span>
        <span className="particula_titulo tp-3"></span>
        <span className="particula_titulo tp-4"></span>
      </div>

      {props.data.map((input, index) => {
        const isSelect = input.options && input.options.length > 0;
        const inputKey = input.name ?? `input-${index}`;

        return isSelect ? (
          <div key={inputKey} style={{ width: "100%" }}>
            <p>{input.label || "Tipo"}</p>
            <select
              className="buscador_estado"
              name={input.name}
              value={props.formData ? props.formData[input.name ?? ""] : ""}
              onChange={props.onItemsFormulario}
            >
              <option value="" disabled>
                Seleccione una opción
              </option>
              {input.options?.map((item, optIndex) => (
                <option key={optIndex} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Inputs
            key={inputKey}
            ref={index === 0 ? primerInputRef : null}
            label={input.label}
            type={input.type}
            placeholder={input.placeholder}
            name={input.name}
            value={props.formData ? props.formData[input.name ?? ""] : ""}
            onChange={props.onChange}
            readonly={input.readonly}
            error={
              props.errorsZod && input.name
                ? props.errorsZod[input.name]
                : undefined
            }
          />
        );
      })}

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
        {props.errorGenerico && <CompoError mensaje={props.errorGenerico} />}
      </div>
    </form>
  );
};
