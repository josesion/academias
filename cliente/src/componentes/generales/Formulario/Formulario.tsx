import React, { useRef, useEffect, useId } from "react";
// Seccion de componentes
import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";
import { CompoError } from "../Error/Error";
import { PhoneInputField } from "../PhoneInputField/PhoneInputField";
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
    | "file"
    | "phone";
  placeholder?: string;
  value?: string | number;
  name?: string;
  error?: string | null;
  hint?: string;
  readonly: boolean;
  options?: string[];
  /** Grupo de columna para layout de 2 columnas. Campos con el mismo grupo van en la misma fila. */
  columnGroup?: number;
  /** Si es true, el campo ocupa el ancho completo aunque tenga columnGroup. */
  fullWidth?: boolean;
  /** Texto separador antes de este campo (divisor visual entre secciones). */
  sectionDivider?: string;
  /** Si es true, el campo se renderiza dentro del panel de contacto (celular, email). */
  contactPanel?: boolean;
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
  const tituloId = useId();

  useEffect(() => {
    if (primerInputRef.current) {
      primerInputRef.current.focus();
    }
  }, []);

  const idErrorGenerico = `${tituloId}-error`;
  const tieneErrorGenerico = Boolean(props.errorGenerico);

  // Handler para PhoneInputField: convierte el string de PhoneInputField a un
  // ChangeEvent para que handleChangeFormulario lo procese como los demas campos.
  const handlePhoneChange = (fieldName: string) => (value: string | undefined) => {
    if (props.onChange) {
      const fakeEvent = {
        target: {
          name: fieldName,
          value: value ?? "",
        },
      } as React.ChangeEvent<HTMLInputElement>;
      props.onChange(fakeEvent);
    }
  };

  // Separar campos de contacto del resto
  const contactoFields: InputsPropsFormulario[] = [];
  const generalFields: InputsPropsFormulario[] = [];

  props.data.forEach((input) => {
    if (input.contactPanel) {
      contactoFields.push(input);
    } else {
      generalFields.push(input);
    }
  });

  // Agrupar campos generales por columnGroup
  const groupedGeneral: (InputsPropsFormulario | InputsPropsFormulario[])[] = [];
  const groupMapGeneral: Record<number, InputsPropsFormulario[]> = {};

  generalFields.forEach((input) => {
    if (input.fullWidth || input.sectionDivider) {
      groupedGeneral.push(input);
    } else if (input.columnGroup !== undefined) {
      if (!groupMapGeneral[input.columnGroup]) {
        groupMapGeneral[input.columnGroup] = [];
      }
      groupMapGeneral[input.columnGroup].push(input);
    } else {
      groupedGeneral.push(input);
    }
  });

  const sortedGroupKeysGeneral = Object.keys(groupMapGeneral)
    .map(Number)
    .sort((a, b) => a - b);

  sortedGroupKeysGeneral.forEach((key) => {
    const group = groupMapGeneral[key];
    const firstIndex = generalFields.indexOf(group[0]);
    const insertPos = groupedGeneral.findIndex(
      (item) => {
        if (Array.isArray(item)) return false;
        const idx = generalFields.indexOf(item);
        return idx > firstIndex && idx < firstIndex + group.length;
      }
    );
    if (insertPos === -1) {
      groupedGeneral.push(group);
    } else {
      groupedGeneral.splice(insertPos, 0, group);
    }
  });

  // Agrupar campos de contacto por columnGroup
  const groupedContacto: (InputsPropsFormulario | InputsPropsFormulario[])[] = [];
  const groupMapContacto: Record<number, InputsPropsFormulario[]> = {};

  contactoFields.forEach((input) => {
    if (input.fullWidth) {
      groupedContacto.push(input);
    } else if (input.columnGroup !== undefined) {
      if (!groupMapContacto[input.columnGroup]) {
        groupMapContacto[input.columnGroup] = [];
      }
      groupMapContacto[input.columnGroup].push(input);
    } else {
      groupedContacto.push(input);
    }
  });

  const sortedGroupKeysContacto = Object.keys(groupMapContacto)
    .map(Number)
    .sort((a, b) => a - b);

  sortedGroupKeysContacto.forEach((key) => {
    const group = groupMapContacto[key];
    const firstIndex = contactoFields.indexOf(group[0]);
    const insertPos = groupedContacto.findIndex(
      (item) => {
        if (Array.isArray(item)) return false;
        const idx = contactoFields.indexOf(item);
        return idx > firstIndex && idx < firstIndex + group.length;
      }
    );
    if (insertPos === -1) {
      groupedContacto.push(group);
    } else {
      groupedContacto.splice(insertPos, 0, group);
    }
  });

  // Combinar: generales primero, luego contacto
  const groupedInputs: (InputsPropsFormulario | InputsPropsFormulario[])[] = [
    ...groupedGeneral,
    ...groupedContacto
  ];

  // Función para renderizar un solo campo
  const renderInput = (input: InputsPropsFormulario, globalIndex: number) => {
    const isSelect = input.options && input.options.length > 0;
    const isPhone = input.type === "phone";
    const inputKey = input.name ?? `input-${globalIndex}`;

    if (isSelect) {
      return (
        <div key={inputKey} style={{ width: "100%" }}>
          <label className="formulario_label_select" htmlFor={inputKey}>
            {input.label || "Tipo"}
          </label>
          <select
            className="buscador_estado"
            id={inputKey}
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
      );
    }

    if (isPhone) {
      return (
        <PhoneInputField
          key={inputKey}
          label={input.label}
          placeholder={input.placeholder}
          name={input.name}
          value={props.formData ? String(props.formData[input.name ?? ""] ?? "") : ""}
          onChange={handlePhoneChange(input.name ?? "")}
          disabled={input.readonly}
          error={
            props.errorsZod && input.name
              ? props.errorsZod[input.name]
              : undefined
          }
        />
      );
    }

    return (
      <Inputs
        key={inputKey}
        ref={globalIndex === 0 ? primerInputRef : null}
        label={input.label}
        type={input.type}
        placeholder={input.placeholder}
        name={input.name}
        value={props.formData ? props.formData[input.name ?? ""] : ""}
        onChange={props.onChange}
        readonly={input.readonly}
        hint={input.hint}
        error={
          props.errorsZod && input.name
            ? props.errorsZod[input.name]
            : undefined
        }
      />
    );
  };

  // Contador global para el primer input ref
  let globalIndexCounter = 0;

  // Función para renderizar un item (campo solo o grupo)
  const renderItem = (item: InputsPropsFormulario | InputsPropsFormulario[], groupIndex: number) => {
    if (Array.isArray(item)) {
      return (
        <div
          key={`group-${groupIndex}`}
          className="formulario_fila"
          style={{
            animationDelay: `${globalIndexCounter * 60}ms`,
          }}
        >
          {item.map((input) => {
            const rendered = renderInput(input, globalIndexCounter);
            globalIndexCounter++;
            return rendered;
          })}
        </div>
      );
    }

    // Campo individual
    const input = item;
    const dividerElement = input.sectionDivider ? (
      <div
        key={`divider-${groupIndex}`}
        className="formulario_separador"
        style={{
          animationDelay: `${globalIndexCounter * 60}ms`,
        }}
      >
        <span className="formulario_separador_texto">{input.sectionDivider}</span>
      </div>
    ) : null;

    const rendered = renderInput(input, globalIndexCounter);
    globalIndexCounter++;

    if (dividerElement) {
      return (
        <React.Fragment key={`section-${groupIndex}`}>
          {dividerElement}
          <div style={{ animationDelay: `${(globalIndexCounter - 1) * 60}ms` }}>
            {rendered}
          </div>
        </React.Fragment>
      );
    }

    return <div key={`single-${groupIndex}`}>{rendered}</div>;
  };

  // Determinar el índice donde empieza el panel de contacto
  const contactoStartIndex = groupedGeneral.length;
  const tieneContacto = groupedContacto.length > 0;

  return (
    <form className="formulario" onSubmit={props.onSubmit} role="form" aria-labelledby={tituloId} aria-describedby={tieneErrorGenerico ? idErrorGenerico : undefined} noValidate>
      <div className="formulario_titulo_container">
        <p id={tituloId} className="formulario_titulo">{props.tituloFormulario}</p>

        {/* Partículas animadas */}
        <span className="particula_titulo tp-1"></span>
        <span className="particula_titulo tp-2"></span>
        <span className="particula_titulo tp-3"></span>
        <span className="particula_titulo tp-4"></span>
      </div>

      {/* Campos generales */}
      {groupedGeneral.map((item, groupIndex) => renderItem(item, groupIndex))}

      {/* Panel de contacto */}
      {tieneContacto && (
        <div className="formulario_panel_contacto">
          <div className="formulario_panel_contacto_titulo">
            <span className="formulario_separador_texto">Contacto</span>
          </div>
          {groupedContacto.map((item, groupIndex) => renderItem(item, contactoStartIndex + groupIndex))}
        </div>
      )}

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

      <div className="errores_genericos" id={`${tituloId}-error`}>
        {props.errorGenerico && <CompoError mensaje={props.errorGenerico} />}
      </div>
    </form>
  );
};
