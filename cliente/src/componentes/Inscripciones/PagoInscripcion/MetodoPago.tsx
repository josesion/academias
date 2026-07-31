import { useState } from "react";

import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";

import "./metodoPago.css";

interface MetodoPago {
  id_metodo: number;
  descripcion_cuenta: string;
}

interface MetodoPagoProps {
  notas: string;
  listaMetodoPago: MetodoPago[];
  handleCachearMetodoPago: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTextAreaNotas: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const MetodoPagoInscripcion: React.FC<MetodoPagoProps> = (props) => {
  const { handleCachearMetodoPago, handleTextAreaNotas, notas } = props;

  const [descripcion, setDescripcion] = useState("");

  return (
    <div className="contenedor_detalle_caja">
      <div className="contenedor_detalle_caja_filtros">
        {/* Usamos las clases de la tarjeta para los selectores */}

        <div className="contenedor_selectores">
          <SelectorOpt
            categorias={props.listaMetodoPago}
            itemKey="id_metodo"
            itemLabel="descripcion_cuenta"
            name="metodo_pago"
            onChangeSelector={handleCachearMetodoPago}
          />
        </div>

        {/* El Textarea lo ponemos como "destacado" para que ocupe las dos columnas */}
        <div className="tarjeta_row destacado">
          <span className="tarjeta_key">Notas / Descripción</span>
          <textarea
            className="tarjeta_textarea"
            value={notas}
            onChange={handleTextAreaNotas}
            placeholder="Añadir observaciones..."
            maxLength={255}
            rows={3}
          />
          <div className="tarjeta_contador">{descripcion.length} / 255</div>
        </div>
      </div>
    </div>
  );
};
