import React, { useId } from "react";
import { ChevronDown, Search } from "lucide-react";
import "./selector.css";

interface PropSelector<T> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  objetoListado: T[];
  titulo: string;
  name: string;
  input_list: string;
  valueKey: string;
  displayKey?: string;
  tipo: "text" | "number";
  value?: string | number;
  /** Texto de ayuda para accesibilidad (se usa en aria-describedby) */
  hint?: string;
  /**
   * Pinta un spinner en el borde derecho del campo mientras se cargan los
   * datos (spec 038).
   *
   * Es **aditiva**: por defecto el campo se ve exactamente igual que antes.
   * El spinner reemplaza al chevron (no conviven) para no sumar elementos ni
   * hacer saltar el layout del input.
   */
  cargando?: boolean;
}

export const SelectorPlegable = <T,>(parametros: PropSelector<T>) => {
  const hintId = useId();
  const hintText = parametros.hint ?? `Escribe para filtrar por ${parametros.valueKey.toLowerCase()}...`;

  return (
    <div className="caja_contenedor">
      <label
        className="selector_label"
        htmlFor={parametros.input_list + "-input"}
      >
        {parametros.titulo}
      </label>

      <div className="selector_input_wrapper">
        <span className="selector_icono_izq" aria-hidden="true">
          <Search size={16} />
        </span>

        <input
          list={parametros.input_list}
          id={parametros.input_list + "-input"}
          name={parametros.name}
          placeholder={hintText}
          onChange={parametros.onChange}
          type={parametros.tipo}
          value={parametros.value}
          className="selector_input_cyber"
          aria-describedby={hintId}
          aria-busy={parametros.cargando || undefined}
          autoComplete="off"
        />

        <span className="selector_icono_der" aria-hidden="true">
          {parametros.cargando ? (
            <span className="spinner_mini" />
          ) : (
            <ChevronDown size={16} />
          )}
        </span>
      </div>

      {parametros.hint && (
        <span id={hintId} className="selector_hint" aria-hidden="true">
          {parametros.hint}
        </span>
      )}

      <datalist id={parametros.input_list} className="selector_contenedor">
        {parametros.objetoListado.map((item: T, index) => {
          let valueToReturn: any = (item as any)[parametros.valueKey];
          let displayLabel: any = valueToReturn;

          if (
            parametros.displayKey === "persona" &&
            (item as any).Nombre &&
            (item as any).Apellido
          ) {
            valueToReturn = (item as any).Dni;
            displayLabel = `${(item as any).Nombre} ${(item as any).Apellido}`;
          }

          return (
            <option key={(item as any).id || index} value={valueToReturn}>
              {displayLabel}
            </option>
          );
        })}
      </datalist>
    </div>
  );
};
