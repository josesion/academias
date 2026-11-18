import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";
import { Inputs } from "../../generales/Inputs/Inputs";
import { Boton } from "../../generales/Boton/Boton";
import { CompoError } from "../../generales/Error/Error";

import type {
  DataTransferenciaCaja,
  ListadoTipoCuentas,
} from "../../../tipadosTs/caja.typado";

import "./transferenciacaja.css";

interface PropsTransferenciaCaja {
  cuentas: ListadoTipoCuentas[];
  form: DataTransferenciaCaja;
  carga: boolean;
  errorMensaje: string | null;
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onRegistrar: () => void;
  onCancelar: () => void;
}

/**
 * Formulario modal para registrar una transferencia interna entre dos cuentas
 * de la misma caja (spec 050).
 *
 * @param {PropsTransferenciaCaja} props - Cuentas, formulario y callbacks.
 * @returns {JSX.Element} Formulario de transferencia.
 */
export const TransferenciaCaja = (props: PropsTransferenciaCaja) => {
  return (
    <div className="contenedor_transferencia_caja">
      <p>Transferencia entre cuentas</p>

      <SelectorOpt<ListadoTipoCuentas>
        categorias={props.cuentas}
        itemKey="id_cuenta"
        itemLabel="nombre_cuenta"
        name="id_cuenta_origen"
        onChangeSelector={props.onChange}
        labelDefault="Cuenta de origen"
        value={props.form.id_cuenta_origen ?? ""}
      />

      <SelectorOpt<ListadoTipoCuentas>
        categorias={props.cuentas}
        itemKey="id_cuenta"
        itemLabel="nombre_cuenta"
        name="id_cuenta_destino"
        onChangeSelector={props.onChange}
        labelDefault="Cuenta de destino"
        value={props.form.id_cuenta_destino ?? ""}
      />

      <Inputs
        name="monto"
        label="Monto"
        placeholder="Ingrese el monto"
        onChange={props.onChange}
        value={props.form.monto}
        type="number"
        readonly={false}
      />

      <div className="memo_transferencia_caja">
        <label className="label_textarea">Descripción / Notas (Opcional)</label>
        <textarea
          name="descripcion"
          className="textarea_chulo"
          placeholder="Detalle de la transferencia..."
          rows={3}
          onChange={props.onChange}
          value={props.form.descripcion}
        />
      </div>

      <div className="botonera_transferencia_caja">
        <Boton
          disable={props.carga}
          texto="Transferir"
          onClick={props.onRegistrar}
          clase="aceptar"
          logo="Go"
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
