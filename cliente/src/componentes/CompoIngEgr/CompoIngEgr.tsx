import { SelectorOpt } from "../CompSelecObt/SelectorOpt";
import { Inputs } from "../Inputs/Inputs";
import { Boton } from "../Boton/Boton";
import { CompoError } from "../Error/Error";

import "./compoIngEgr.css";

interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  tipo_movimiento: string;
}
type MetodoPago = "efectivo" | "transferencia" | "credito" | "debito";
interface Tipo_pago {
  id_tipo_pago: number;
  nombre_tipo_pago: MetodoPago;
}

interface ComporProps {
  titulo: string;
  errorMensaje: string | null;
  // Lo que nesesita el selector para funcionar, lo hacemos genérico para poder reutilizarlo en otros lados sin atarnos a una estructura específica de datos

  categorias: Categoria[];
  onChangeSelector: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  labelDefault?: string;
  itemKey?: string; // lo q nesesita el selector para funcionar
  itemLabel?: string; // lo q nesesita el selector para funcionar

  // lo que nesesita  el selector tipo de pagos
  tipos_pago: Tipo_pago[];
  onChanceSelectorTipo: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  nameTipoPago?: string;
  itemKeyTipo?: string;
  itemLabelTipo?: string;
  // lo q nesesita el inputs
  montoValue: number | null | string;
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

      <SelectorOpt<Tipo_pago>
        categorias={props.tipos_pago}
        itemKey={props.itemKeyTipo as keyof Tipo_pago}
        itemLabel={props.itemLabelTipo as keyof Tipo_pago}
        name={props.nameTipoPago}
        onChangeSelector={props.onChanceSelectorTipo}
        labelDefault="Seleccionar medio de pago"
      />

      <Inputs
        name="monto"
        label="Monto"
        placeholder="Ingrese el monto"
        onChange={props.onChangeInput}
        value={props.montoValue ? props.montoValue : ""}
        key={1}
        type="number"
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
      {props.errorMensaje && <CompoError mensaje={props.errorMensaje} />}
    </div>
  );
};
