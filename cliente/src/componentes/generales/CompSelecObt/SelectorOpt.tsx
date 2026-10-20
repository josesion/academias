import React, { useId } from "react";
import "./selectorOBT.css";

interface CompoIEProps<T> {
  categorias: T[];
  // Le decimos qué llaves del objeto usar
  itemKey: keyof T;
  itemLabel: keyof T;
  onChangeSelector: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  /**
   * Valor seleccionado (spec 039).
   *
   * **Es obligatoria en la práctica**: el select es controlado (`value={value ?? ""}`),
   * así que si se omite, React restaura el placeholder después de cada `change` y la
   * opción elegida NUNCA queda visible (aunque el `onChange` haya guardado el dato).
   * Pasar siempre el valor real del estado (`null` → `""`).
   */
  value?: string | number;
  labelDefault?: string;
  /** Solo lectura: pinta el select grisado y fuera de tab (spec 008) */
  disabled?: boolean;
  /** Etiqueta accesible cuando no hay label visible externo */
  ariaLabel?: string;
  /** Mensaje de error para anunciar con aria-describedby */
  error?: string | null;
}

// Usamos <T,> para que el compilador sepa que es un Generic
export const SelectorOpt = <T,>({
  categorias,
  itemKey,
  itemLabel,
  onChangeSelector,
  name,
  value,
  labelDefault = "Seleccionar",
  disabled,
  ariaLabel,
  error,
}: CompoIEProps<T>) => {
  const idUnico = useId();
  const selectId = name || `selector-${idUnico}`;
  const idError = `${selectId}_error`;
  const tieneError = Boolean(error);

  return (
    <div className="grupo_input_caja">
      <select
        className="input_caja"
        id={selectId}
        name={name}
        value={value ?? ""}
        onChange={onChangeSelector}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={tieneError ? true : undefined}
        aria-describedby={tieneError ? idError : undefined}
      >
        <option value="">{labelDefault}</option>
        {categorias.map((item, index) => (
          <option
            key={String(item[itemKey]) || index}
            value={String(item[itemKey])}
          >
            {String(item[itemLabel])}
          </option>
        ))}
      </select>
      {error && (
        <p className="mensaje_error" id={idError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
