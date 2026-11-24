import { useEffect, useRef, useState } from "react";
import { X, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAsistenciaQR } from "../../../hooks/asistenciaQR";

/**
 * Modal de escaneo QR para registrar asistencia.
 *
 * Abre la cámara del dispositivo, lee el código QR, extrae el
 * `id_horario_clase` y envía la petición al backend.
 */
type EscaneoQRProps = {
  onClose: () => void;
};

export const EscaneoQR = ({ onClose }: EscaneoQRProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<Html5QrcodeScanner | null>(null);
  const [estado, setEstado] = useState<"escaneando" | "exito" | "error">("escaneando");

  const { cargando, error, exito, registrarAsistencia, resetear } = useAsistenciaQR();

  // Cuando el hook reporta éxito, cambiar estado
  useEffect(() => {
    if (exito) {
      setEstado("exito");
    }
  }, [exito]);

  // Cuando el hook reporta error, cambiar estado
  useEffect(() => {
    if (error) {
      setEstado("error");
    }
  }, [error]);

  // Inicializar el escáner al montar
  useEffect(() => {
    if (!scannerRef.current) return;

    const onScanSuccess = (decodedText: string) => {
      try {
        const datos = JSON.parse(decodedText);
        if (datos && typeof datos.id_horario_clase === "number") {
          registrarAsistencia(datos.id_horario_clase);
        } else {
          setEstado("error");
        }
      } catch {
        // QR no es JSON válido
        setEstado("error");
      }
    };

    const scanner = new Html5QrcodeScanner("qr-scanner-region", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
    }, false);

    scanner.render(onScanSuccess, () => {
      // onScanFailure: ignorar, es normal mientras busca
    });

    scannerInstanceRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
      scannerInstanceRef.current = null;
    };
  }, [registrarAsistencia]);

  const handleCerrar = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.clear().catch(() => {});
      scannerInstanceRef.current = null;
    }
    resetear();
    onClose();
  };

  // Estado de éxito
  if (estado === "exito") {
    return (
      <div className="qr-overlay" onClick={handleCerrar}>
        <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
          <button className="qr-modal_cerrar" onClick={handleCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
          <div className="qr-modal_contenido">
            <CheckCircle size={48} className="qr-modal_icono exito" />
            <h3>¡Asistencia registrada!</h3>
            <p>Que disfrutes la clase.</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (estado === "error") {
    const mensaje = error || "No se pudo leer el código QR";
    return (
      <div className="qr-overlay" onClick={handleCerrar}>
        <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
          <button className="qr-modal_cerrar" onClick={handleCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
          <div className="qr-modal_contenido">
            <AlertCircle size={48} className="qr-modal_icono error" />
            <h3>Error al registrar</h3>
            <p>{mensaje}</p>
            <button className="qr-modal_btn" onClick={handleCerrar}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado de escaneo activo
  return (
    <div className="qr-overlay">
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="qr-modal_cerrar" onClick={handleCerrar} aria-label="Cerrar escáner">
          <X size={20} />
        </button>
        <div className="qr-modal_encabezado">
          <QrCode size={24} />
          <h3>Escaneá el código QR</h3>
        </div>
        <p className="qr-modal_instruccion">
          Apuntá la cámara al código QR que muestra el kiosko
        </p>
        <div ref={scannerRef} id="qr-scanner-region" className="qr-scanner" />
        {cargando && <p className="qr-modal_cargando">Registrando asistencia…</p>}
      </div>
    </div>
  );
};
