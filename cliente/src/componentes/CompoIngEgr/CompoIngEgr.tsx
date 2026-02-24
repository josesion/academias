import { SelectorOpt } from "../CompSelecObt/SelectorOpt";
import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";

import "./compoIngEgr.css";

interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  tipo_movimiento: string;
}

interface ComporProps {
  titulo: string;
  // Lo que nesesita el selector para funcionar, lo hacemos genérico para poder reutilizarlo en otros lados sin atarnos a una estructura específica de datos
  categorias: Categoria[];
  onChangeSelector: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  labelDefault?: string;
  itemKey?: string; // lo q nesesita el selector para funcionar
  itemLabel?: string; // lo q nesesita el selector para funcionar
  // lo q nesesita el inputs
  montoValue: string;
  onChangeInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // lo q nesesita el boton
  onClickRegistrar?: () => void;
  onClickCancelar?: () => void;
  // lo q nesesita el textarea
  onChangeTextArea?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  valueTextArea: string;
}

export const CompoIngEgr = (props: ComporProps) => {
  return (
    <div className="contenedor_compoIngEgr">
      <p>Categorias Caja : ({props.titulo})</p>
      <SelectorOpt<Categoria>
        categorias={props.categorias}
        itemKey={props.itemKey as keyof Categoria}
        itemLabel={props.itemLabel as keyof Categoria}
        name={props.name}
        onChangeSelector={props.onChangeSelector}
        labelDefault={props.labelDefault || "Seleccionar Categoría"}
      />

      <Inputs
        name="monto"
        label="Monto"
        placeholder="Ingrese el monto"
        onChange={props.onChangeInput}
        value={props.montoValue}
        key={1}
        readonly={false}
      />

      <div className="memo_compoIngEgr">
        <label className="label_textarea">Descripción / Notas (Opcional)</label>
        <textarea
          name="descripcion"
          className="textarea_chulo"
          placeholder="Detalle del movimiento..."
          rows={3} // Esto le da la altura inicial de 3 líneas
          onChange={props.onChangeTextArea}
          value={props.valueTextArea}
        />
      </div>

      <div className="botonera_compoIngEgr">
        <Boton
          texto="Registrar"
          onClick={props.onClickRegistrar}
          clase="aceptar"
          logo="Add"
        />
        <Boton
          texto="Cancelar"
          onClick={props.onClickCancelar}
          clase="cancelar"
          logo="Cancel"
        />
      </div>
    </div>
  );
};
