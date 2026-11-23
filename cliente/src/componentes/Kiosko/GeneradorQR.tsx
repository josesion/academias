import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import "./generadorQR.css";

/**
 * Genera y muestra un código QR con el `id_horario_clase` de una clase.
 * El alumno escanea este QR desde su celular para registrar asistencia.
 */
type GeneradorQRProps = {
  idHorarioClase: number;
  nombreClase?: string;
  horaInicio?: string;
  horaFin?: string;
  sala?: string;
};

export const GeneradorQR = ({
  idHorarioClase,
  nombreClase,
  horaInicio,
  horaFin,
  sala,
}: GeneradorQRProps) => {
  // El contenido del QR es un JSON simple con el id_horario_clase
  const qrContent = JSON.stringify({ id_horario_clase: idHorarioClase });

  return (
    <div className="generador_qr">
      <div className="generador_qr_header">
        <QrCode size={20} aria-hidden="true" />
        <span>Código QR de asistencia</span>
      </div>

      {nombreClase && (
        <div className="generador_qr_clase_info">
          <h3>{nombreClase}</h3>
          <p>
            {horaInicio} – {horaFin}
            {sala ? ` · ${sala}` : ""}
          </p>
        </div>
      )}

      <div className="generador_qr_codigo">
        <QRCodeSVG
          value={qrContent}
          size={240}
          level="M"
          marginSize={4}
          fgColor="#1a1a1a"
          bgColor="#ffffff"
        />
      </div>

      <p className="generador_qr_instruccion">
        Escaneá este código con tu celular desde la sección del alumno para
        registrar tu asistencia.
      </p>
    </div>
  );
};
