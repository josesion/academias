import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";
import "./buscador.css";

export type InputsPropsBuscador = {
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
  options?: string[];
};

interface BuscadorProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAgregar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onEstados?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onItems?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  intputBuscador: InputsPropsBuscador[];
  tituloBuscador?: string;
  buscadorData?: Record<string, string | number>;
  captionBoton: string;
  estados: string[];
}

export const Buscadores = (p: BuscadorProps) => {
  return (
    <div className="buscador_contenedor_comp">
      {p.tituloBuscador && (
        <p className="buscador_titulo">{p.tituloBuscador}</p>
      )}

      <div className="buscador_cuerpo">
        {/* Renderizado de Inputs y Selects dinámicos */}
        {p.intputBuscador.map((input) => {
          const isSelect = input.options && input.options.length > 0;

          return (
            <div className="buscador_columna" key={input.name}>
              {isSelect ? (
                <>
                  <label className="buscador_label_generico">
                    {input.label || "Tipo"}
                  </label>
                  <select
                    className="buscador_input_base"
                    name={input.name}
                    onChange={p.onItems}
                    value={p.buscadorData?.[input.name ?? ""] || ""}
                  >
                    {input.options?.map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <Inputs
                  label={input.label}
                  type={input.type}
                  name={input.name}
                  value={p.buscadorData?.[input.name ?? ""] || ""}
                  onChange={p.onChange}
                  placeholder={input.placeholder}
                  readonly={false}
                />
              )}
            </div>
          );
        })}

        {/* Selector de Estado */}
        <div className="buscador_columna">
          <label className="buscador_label_generico">Estado</label>
          <select
            className="buscador_input_base"
            name="estado"
            onChange={p.onEstados}
          >
            {p.estados.map((estado, index) => (
              <option key={index} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Agregar - Con label vacío para nivelar */}
        <div className="buscador_columna">
          <label className="buscador_label_generico">&nbsp;</label>
          <Boton
            texto={p.captionBoton}
            logo="Add"
            clase="aceptar"
            onClick={p.onAgregar}
          />
        </div>
      </div>
    </div>
  );
};
