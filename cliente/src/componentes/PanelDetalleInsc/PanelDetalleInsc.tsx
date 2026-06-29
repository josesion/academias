import { SelectorOpt } from "../CompSelecObt/SelectorOpt";
import { Boton } from "../Boton/Boton";
import { CompoError } from "../Error/Error";

import "./paneldetalleinsc.css";

interface ListadoCuentas {
  id_cuenta: number;
  nombre_cuenta: string;
}

export interface DataDetalle {
  infoDetalle?: {
    nombre_completo: string;
    dni_alumno: number;
    clases_totales: number;
    clases_tomadas: number;
    vigencia: string;
    monto_pagado: string;
    metodo_pago_descrip: string;
  };
  errorAnulacion: string | null;
  carga: boolean;
  listaMetodoPago: ListadoCuentas[];
  onChangeMetodo: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  anularInscripcion?: () => void;
  cancelarPanel?: () => void;
}

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
          categorias={props.listaMetodoPago ?? []}
          itemKey="id_cuenta"
          itemLabel="nombre_cuenta"
          onChangeSelector={props.onChangeMetodo}
          name="metodo_pago"
        />
        <div className="contenedor_panel_botones">
          <Boton
            clase="aceptar"
            logo="Delete"
            texto="Anular"
            onClick={props.anularInscripcion}
            disable={props.carga}
          />
        </div>

        {props.errorAnulacion && <CompoError mensaje={props.errorAnulacion} />}
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
