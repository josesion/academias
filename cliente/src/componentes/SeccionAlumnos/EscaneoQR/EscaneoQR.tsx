import { useEffect, useRef, useState } from "react";
import { X, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useAsistenciaQR } from "../../../hooks/asistenciaQR";

type ErrorInicioEscaner = "sin-camara" | "permiso-denegado" | "no-disponible" | null;

/** Clasifica los errores habituales al solicitar acceso a la cámara. */
const clasificarErrorInicioEscaner = (error: unknown): Exclude<ErrorInicioEscaner, null> => {
  const nombreError = error instanceof Error ? error.name : "";

  if (nombreError === "NotFoundError" || nombreError === "DevicesNotFoundError") {
    return "sin-camara";
  }

  if (
    nombreError === "NotAllowedError" ||
    nombreError === "PermissionDeniedError" ||
    nombreError === "SecurityError"
  ) {
    return "permiso-denegado";
  }

  return "no-disponible";
};

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
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const [estado, setEstado] = useState<"escaneando" | "exito" | "error">("escaneando");
  const [errorInicioEscaner, setErrorInicioEscaner] = useState<ErrorInicioEscaner>(null);

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

    let resultadoProcesado = false;
    const onScanSuccess = (decodedText: string) => {
      if (resultadoProcesado) return;
      resultadoProcesado = true;

      if (scannerInstanceRef.current?.isScanning) {
        scannerInstanceRef.current.stop().catch(() => {});
      }

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

    const scanner = new Html5Qrcode("qr-scanner-region", false);
    scannerInstanceRef.current = scanner;
    let activo = true;
    const inicioEscaner = scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        videoConstraints: { facingMode: { ideal: "environment" } },
      },
      onScanSuccess,
      () => {
        // Ignorar: es normal mientras busca un código QR.
      },
    ).catch((error: unknown) => {
      if (activo) {
        setErrorInicioEscaner(clasificarErrorInicioEscaner(error));
        setEstado("error");
      }
    });

    return () => {
      activo = false;
      void inicioEscaner.then(async () => {
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      }).catch(() => {});
      scannerInstanceRef.current = null;
    };
  }, [registrarAsistencia]);

  const handleCerrar = () => {
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
    const mensaje = errorInicioEscaner === "sin-camara"
      ? "Este equipo no tiene una cámara disponible. Conectá una cámara para escanear el código QR."
      : errorInicioEscaner === "permiso-denegado"
        ? "El navegador no tiene permiso para usar la cámara. Habilitá el permiso e intentá nuevamente."
        : errorInicioEscaner === "no-disponible"
          ? "No se pudo iniciar la cámara. Verificá que esté conectada y que no esté siendo usada por otra aplicación."
          : error || "No se pudo leer un código QR válido.";
    return (
      <div className="qr-overlay" onClick={handleCerrar}>
        <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
          <button className="qr-modal_cerrar" onClick={handleCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
          <div className="qr-modal_contenido">
            <AlertCircle size={48} className="qr-modal_icono error" />
            <h3>{errorInicioEscaner ? "No se pudo abrir la cámara" : "Error al registrar"}</h3>
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
