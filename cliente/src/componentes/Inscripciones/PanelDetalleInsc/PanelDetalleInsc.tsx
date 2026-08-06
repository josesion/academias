import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";
import { Boton } from "../../generales/Boton/Boton";
import { CompoError } from "../../generales/Error/Error";

import { Calendar, Wallet, Hash, Info, User } from "lucide-react";

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
    <div className="recibo_ticket ticket_inscripcion">
      <header className="recibo_header">
        <div className="recibo_marca">
          <User size={14} />
          <span>{props.infoDetalle?.nombre_completo}</span>
        </div>

        <div className="recibo_stamp stamp_neutro">
          DNI {props.infoDetalle?.dni_alumno}
        </div>
      </header>

      <div className="recibo_total">
        <span className="recibo_total_label">Monto pagado</span>

        <div className="recibo_monto monto_neutro">
          <span>${props.infoDetalle?.monto_pagado}</span>
        </div>
      </div>

      <div className="recibo_perforado" />

      <div className="recibo_body">
        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Calendar size={14} /> Vence
          </span>
          <span className="recibo_fila_valor">
            {props.infoDetalle?.vigencia}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Wallet size={14} /> Pago original
          </span>
          <span className="recibo_fila_valor">
            {props.infoDetalle?.metodo_pago_descrip}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Hash size={14} /> Consumo
          </span>
          <span className="recibo_fila_valor">
            {props.infoDetalle?.clases_tomadas} /{" "}
            {props.infoDetalle?.clases_totales}
          </span>
        </div>

        <div className="recibo_linea_punteada" />

        <div className="panel_anular_bloque">
          <span className="panel_anular_label">
            <Info size={12} /> Anular inscripción
          </span>

          <SelectorOpt
            categorias={props.listaMetodoPago ?? []}
            itemKey="id_cuenta"
            itemLabel="nombre_cuenta"
            onChangeSelector={props.onChangeMetodo}
            name="metodo_pago"
          />

          <Boton
            clase="aceptar"
            logo="Delete"
            texto="Anular"
            onClick={props.anularInscripcion}
            disable={props.carga}
          />

          {props.errorAnulacion && (
            <CompoError mensaje={props.errorAnulacion} />
          )}
        </div>
      </div>

      <div className="recibo_footer">
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
