import { useEffect, useState } from "react";
import { FaUnlock, FaPowerOff } from "react-icons/fa";
import "./animacionapertura.css"; // Crearemos uno similar

interface AnimacionAperturaProps {
  onFinished?: () => void;
  usuario?: string;
}

export const AnimacionAperturaExitosa = ({
  onFinished,
  usuario,
}: AnimacionAperturaProps) => {
  const [fase, setFase] = useState(1);

  useEffect(() => {
    // Fase 1: Iniciando Sistemas
    // Fase 2: Validando Seguridad
    // Fase 3: Caja Lista
    const timer1 = setTimeout(() => setFase(2), 500);
    const timer2 = setTimeout(() => setFase(3), 1100);
    const timer3 = setTimeout(() => {
      if (onFinished) onFinished();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinished]);

  return (
    <div className="overlay_animacion_apertura">
      <div className={`contenedor_apertura ${fase === 3 ? "activa" : ""}`}>
        <div className="circulo_central">
          {fase < 3 ? (
            <div className={`icon_power ${fase === 2 ? "cargando" : ""}`}>
              <FaPowerOff />
            </div>
          ) : (
            <div className="icon_unlock">
              <FaUnlock />
            </div>
          )}
          {/* Anillos de energía decorativos */}
          <div className="ring_aura"></div>
        </div>

        <div className="textos_apertura">
          <h2 className={fase === 3 ? "texto_neon_verde" : ""}>
            {fase === 1 && "Inicializando Terminal..."}
            {fase === 2 && "Verificando Seguridad..."}
            {fase === 3 && "¡Caja Abierta!"}
          </h2>
          {fase === 3 && (
            <p className="usuario_apertura">Operador: {usuario || "Sistema"}</p>
          )}
        </div>

        {/* Efecto de escaneo horizontal */}
        {fase === 2 && <div className="scanner_apertura"></div>}
      </div>
    </div>
  );
};
