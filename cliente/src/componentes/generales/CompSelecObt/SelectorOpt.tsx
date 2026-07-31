import "./selectorOBT.css";

interface CompoIEProps<T> {
  categorias: T[];
  // Le decimos qué llaves del objeto usar
  itemKey: keyof T;
  itemLabel: keyof T;
  onChangeSelector: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  labelDefault?: string;
}

// Usamos <T,> para que el compilador sepa que es un Generic
export const SelectorOpt = <T,>({
  categorias,
  itemKey,
  itemLabel,
  onChangeSelector,
  name,
  labelDefault = "Seleccionar",
}: CompoIEProps<T>) => {
  return (
    <div className="grupo_input_caja">
      <select className="input_caja" name={name} onChange={onChangeSelector}>
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
