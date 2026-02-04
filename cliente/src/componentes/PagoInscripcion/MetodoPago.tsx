import { useState } from "react";

import { SelectorPlegable } from "../Selector/Selector";

import "./metodoPago.css";

export const METODOS_PAGO = [
  { id: "efectivo", label: "Efectivo", icono: "💵" },
  { id: "transferencia", label: "Transferencia Bancaria", icono: "🏦" },
  { id: "debito", label: "Tarjeta de Débito", icono: "💳" },
  { id: "credito", label: "Tarjeta de Crédito", icono: "💳" },
];

interface MetodoPagoProps {
  notas: string;
  handleCachearMetodoPago: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
          <SelectorPlegable
            titulo="Metodo de pago"
            objetoListado={METODOS_PAGO}
            onChange={handleCachearMetodoPago}
            input_list="list_metodos"
            valueKey="id"
            tipo="text"
            name="id"
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
