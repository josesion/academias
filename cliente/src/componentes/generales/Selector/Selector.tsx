import React from "react";
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
  value?: string | number; // Agregado opcional por si se usa controlado
}

export const SelectorPlegable = <T,>(parametros: PropSelector<T>) => {
  return (
    <div className="caja_contenedor">
      <label
        className="selector_label"
        htmlFor={parametros.input_list + "-input"}
      >
        {parametros.titulo}
      </label>

      <div className="selector_input_wrapper">
        <span className="selector_icono_izq">
          <Search size={16} />
        </span>

        <input
          list={parametros.input_list}
          id={parametros.input_list + "-input"}
          name={parametros.name}
          placeholder={`Buscar ${parametros.valueKey}...`}
          onChange={parametros.onChange}
          type={parametros.tipo}
          value={parametros.value}
          className="selector_input_cyber"
        />

        <span className="selector_icono_der">
          <ChevronDown size={16} />
        </span>
      </div>

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
