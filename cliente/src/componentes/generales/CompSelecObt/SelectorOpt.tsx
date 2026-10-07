import "./selectorOBT.css";

interface CompoIEProps<T> {
  categorias: T[];
  // Le decimos qué llaves del objeto usar
  itemKey: keyof T;
  itemLabel: keyof T;
  onChangeSelector: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  value?: string | number;
  labelDefault?: string;
  /** Solo lectura: pinta el select grisado y fuera de tab (spec 008) */
  disabled?: boolean;
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
}: CompoIEProps<T>) => {
  return (
    <div className="grupo_input_caja">
      <select
        className="input_caja"
        name={name}
        value={value ?? ""}
        onChange={onChangeSelector}
        disabled={disabled}
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
    </div>
  );
};
