import { SelectorOpt } from "../CompSelecObt/SelectorOpt";
import { Boton } from "../Boton/Boton";

import "./paneldetalleinsc.css";

interface DataDetalle {
  infoDetalle?: {
    nombre_completo: string;
    dni_alumno: number;
    clases_totales: number;
    clases_tomadas: number;
    vigencia: string;
    monto_pagado: number;
    metodo_pago_descrip: string;
  };
  anularInscripcion?: () => void;
  cancelarPanel?: () => void;
}

const metodotopagoprueba = [
  { id: 1, metodo: "transferencia" },
  { id: 2, metodo: "efectivo" },
];

export const PanelDetalleInscrip = (props: DataDetalle) => {
  return (
    <div className="contenedor_panel">
      {/* Bloque de Información */}
      <div className="contendor_panel_info">
        <h3>{props.infoDetalle?.nombre_completo}</h3>
        <p>DNI: {props.infoDetalle?.dni_alumno}</p>
        <p>Vence: {props.infoDetalle?.vigencia}</p>
        <p>Monto: ${props.infoDetalle?.monto_pagado}</p>
        <p>Pago original: {props.infoDetalle?.metodo_pago_descrip}</p>
        <p>
          Consumo: {props.infoDetalle?.clases_tomadas} /{" "}
          {props.infoDetalle?.clases_totales}
        </p>
      </div>

      <div className="contenedor_panel_anular">
        <SelectorOpt
          categorias={metodotopagoprueba}
          itemKey="id"
          itemLabel="id"
          onChangeSelector={() => {}}
          name="metodo_pago"
          labelDefault="Metodo pago"
        />
        <div className="contenedor_panel_botones">
          <Boton
            clase="aceptar"
            logo="Delete"
            texto="Anular"
            onClick={props.anularInscripcion}
          />
        </div>
      </div>

      <div className="contenedor_panel_botones">
        <Boton
          clase="cancelar"
          logo="Cancel"
          texto="Cerrar"
          onClick={props.cancelarPanel}
        />
      </div>
    </div>
  );
};
