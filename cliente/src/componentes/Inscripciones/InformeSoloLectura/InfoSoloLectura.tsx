// PanelDetalleInscripSoloLectura.tsx
import { useId } from "react";
import { Boton } from "../../generales/Boton/Boton";
import { Calendar, Wallet, Hash, User, Lock } from "lucide-react";
import { useModalAccesible } from "../../../hooks/useModalAccesible";

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

const ICONO_SELLO: Record<string, React.ReactNode> = {
  activos: <span aria-hidden="true">✓</span>,
  vencidos: <span aria-hidden="true">✕</span>,
  suspendido: <span aria-hidden="true">⏸</span>,
};

export const PanelDetalleInscripSoloLectura = ({
  infoDetalle,
  estado,
  onCerrar,
}: PropsSoloLectura) => {
  const claseSello = CLASE_SELLO[estado] ?? "sello_neutro";
  const textoSello = TEXTO_SELLO[estado] ?? estado;
  const iconoSello = ICONO_SELLO[estado] ?? null;

  const tituloId = useId();
  const descripcionId = useId();

  const { refDialog } = useModalAccesible({
    abierto: true,
    onCerrar: onCerrar ?? (() => {}),
    cerrable: true,
  });

  return (
    <div
      ref={refDialog}
      className="recibo_ticket ticket_inscripcion"
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      aria-describedby={descripcionId}
    >
      <header className="recibo_header">
        <div className="recibo_marca">
          <User size={14} aria-hidden="true" />
          <span id={tituloId}>{infoDetalle?.nombre_completo}</span>
        </div>

        <div className={`recibo_stamp ${claseSello}`}>
          {iconoSello}
          <span>{textoSello}</span>
        </div>
      </header>

      <div className="recibo_total">
        <h3 className="section-title section-title--card">Monto pagado</h3>

        <div className="recibo_monto monto_neutro">
          <span>${infoDetalle?.monto_pagado ?? "—"}</span>
        </div>
      </div>

      <div className="recibo_perforado" aria-hidden="true" />

      <div id={descripcionId} className="recibo_body">
        <h4 className="section-title section-title--card">Detalle de inscripción</h4>
        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Hash size={14} aria-hidden="true" /> DNI
          </span>
          <span className="recibo_fila_valor">
            {infoDetalle?.dni_alumno?.toLocaleString("es-AR") ?? "—"}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Calendar size={14} aria-hidden="true" /> Vence
          </span>
          <span className="recibo_fila_valor">
            {infoDetalle?.vigencia ?? "—"}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Wallet size={14} aria-hidden="true" /> Pago original
          </span>
          <span className="recibo_fila_valor">
            {infoDetalle?.metodo_pago_descrip ?? "—"}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Hash size={14} aria-hidden="true" /> Consumo
          </span>
          <span className="recibo_fila_valor">
            {infoDetalle?.clases_tomadas ?? 0} /{" "}
            {infoDetalle?.clases_totales ?? 0}
          </span>
        </div>

        <div className="recibo_linea_punteada" aria-hidden="true" />

        <div className="panel_solo_lectura_nota">
          <Lock size={13} aria-hidden="true" />
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