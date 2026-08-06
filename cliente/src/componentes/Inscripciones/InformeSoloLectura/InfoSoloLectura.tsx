// PanelDetalleInscripSoloLectura.tsx
import { Boton } from "../../generales/Boton/Boton";
import { Calendar, Wallet, Hash, User, Lock } from "lucide-react";

import "./infoSoloLectura.css";

interface InfoDetalleSoloLectura {
  nombre_completo: string;
  dni_alumno: number;
  clases_totales: number;
  clases_tomadas: number;
  vigencia: string;
  monto_pagado: string;
  metodo_pago_descrip: string;
}

interface PropsSoloLectura {
  infoDetalle?: InfoDetalleSoloLectura;
  estado: string;
  onCerrar?: () => void;
}

const CLASE_SELLO: Record<string, string> = {
  activos: "sello_verde",
  vencidos: "sello_rojo",
  suspendido: "sello_ambar",
};

const TEXTO_SELLO: Record<string, string> = {
  activos: "Activa",
  vencidos: "Vencida",
  suspendido: "Suspendida",
};

export const PanelDetalleInscripSoloLectura = ({
  infoDetalle,
  estado,
  onCerrar,
}: PropsSoloLectura) => {
  const claseSello = CLASE_SELLO[estado] ?? "sello_neutro";
  const textoSello = TEXTO_SELLO[estado] ?? estado;

  return (
    <div className="recibo_ticket ticket_inscripcion">
      <header className="recibo_header">
        <div className="recibo_marca">
          <User size={14} />
          <span>{infoDetalle?.nombre_completo}</span>
        </div>

        <div className={`recibo_stamp ${claseSello}`}>{textoSello}</div>
      </header>

      <div className="recibo_total">
        <span className="recibo_total_label">Monto pagado</span>

        <div className="recibo_monto monto_neutro">
          <span>${infoDetalle?.monto_pagado ?? "—"}</span>
        </div>
      </div>

      <div className="recibo_perforado" />

      <div className="recibo_body">
        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Hash size={14} /> DNI
          </span>
          <span className="recibo_fila_valor">
            {infoDetalle?.dni_alumno?.toLocaleString("es-AR") ?? "—"}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Calendar size={14} /> Vence
          </span>
          <span className="recibo_fila_valor">
            {infoDetalle?.vigencia ?? "—"}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Wallet size={14} /> Pago original
          </span>
          <span className="recibo_fila_valor">
            {infoDetalle?.metodo_pago_descrip ?? "—"}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Hash size={14} /> Consumo
          </span>
          <span className="recibo_fila_valor">
            {infoDetalle?.clases_tomadas ?? 0} /{" "}
            {infoDetalle?.clases_totales ?? 0}
          </span>
        </div>

        <div className="recibo_linea_punteada" />

        <div className="panel_solo_lectura_nota">
          <Lock size={13} />
          <span>
            Esta inscripción no está activa — solo podés consultar sus datos.
          </span>
        </div>
      </div>

      <div className="recibo_footer">
        <Boton
          clase="cancelar"
          logo="Cancel"
          texto="Cerrar"
          onClick={onCerrar}
        />
      </div>
    </div>
  );
};
