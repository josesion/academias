import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";
import { Inputs } from "../../generales/Inputs/Inputs";
import { Boton } from "../../generales/Boton/Boton";
import { CompoError } from "../../generales/Error/Error";

import type {
  DataRetencionCaja,
  ListadoTipoCuentas,
} from "../../../tipadosTs/caja.typado";

import "./retencioncaja.css";

interface PropsRetencionCaja {
  cuentas: ListadoTipoCuentas[];
  form: DataRetencionCaja;
  carga: boolean;
  errorMensaje: string | null;
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onRegistrar: () => void;
  onCancelar: () => void;
}

/**
 * Formulario modal para registrar una retención de efectivo (spec 050).
 *
 * La retención nace activa: resta del saldo de la cuenta pero no cuenta como
 * gasto hasta que se devuelva o justifique.
 *
 * @param {PropsRetencionCaja} props - Cuentas, formulario y callbacks.
 * @returns {JSX.Element} Formulario de retención.
 */
export const RetencionCaja = (props: PropsRetencionCaja) => {
  return (
    <div className="contenedor_retencion_caja">
      <p>Retención de efectivo</p>

      <SelectorOpt<ListadoTipoCuentas>
        categorias={props.cuentas}
        itemKey="id_cuenta"
        itemLabel="nombre_cuenta"
        name="id_cuenta"
        onChangeSelector={props.onChange}
        labelDefault="Cuenta de la retención"
        value={props.form.id_cuenta ?? ""}
      />

      <Inputs
        name="monto"
        label="Monto"
        placeholder="Ingrese el monto retenido"
        onChange={props.onChange}
        value={props.form.monto}
        type="number"
        readonly={false}
      />

      <div className="memo_retencion_caja">
        <label className="label_textarea">Descripción / Notas (Opcional)</label>
        <textarea
          name="descripcion"
          className="textarea_chulo"
          placeholder="Motivo de la retención..."
          rows={3}
          onChange={props.onChange}
          value={props.form.descripcion}
        />
      </div>

      <div className="botonera_retencion_caja">
        <Boton
          disable={props.carga}
          texto="Retener"
          onClick={props.onRegistrar}
          clase="aceptar"
          logo="Add"
        />
        <Boton
          texto="Cancelar"
          onClick={props.onCancelar}
          clase="cancelar"
          logo="Cancel"
        />
      </div>

      {props.errorMensaje && <CompoError mensaje={props.errorMensaje} />}
    </div>
  );
};
