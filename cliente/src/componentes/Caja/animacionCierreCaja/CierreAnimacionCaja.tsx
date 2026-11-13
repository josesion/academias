import { useEffect, useState } from "react";
import { FaLock, FaPowerOff } from "react-icons/fa";
import "./cierreanimacioncaja.css";

interface AnimacionCierreProps {
  onFinished?: () => void;
  usuario?: string;
}

export const AnimacionCierreExitoso = ({
  onFinished,
  usuario,
}: AnimacionCierreProps) => {
  const [fase, setFase] = useState(1);

  useEffect(() => {
    // Fase 1: Consolidando Movimientos
    // Fase 2: Generando Arqueo
    // Fase 3: Caja Cerrada
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
      <div className={`card_apertura ${fase === 3 ? "finalizada_cierre" : ""}`}>
        <div className="estado_icono">
          {fase < 3 ? (
            <div className="spinner_estado">
              <FaPowerOff />
            </div>
          ) : (
            <div className="icono_ok icono_cierre_ok">
              <FaLock />
            </div>
          )}
        </div>

        <div className="contenido_estado">
          <span className="estado_pequeño">Sistema de Caja</span>

          <h2>
            {fase === 1 && "Consolidando turnos..."}
            {fase === 2 && "Generando arqueo..."}
            {fase === 3 && "Caja cerrada correctamente"}
          </h2>

          <p>
            {fase === 1 && "Procesando cobros y registros pendientes"}
            {fase === 2 && "Guardando balance y resumen final"}
            {fase === 3 && `Sesión finalizada, ${usuario ?? "Operador"}`}
          </p>
        </div>

        <div className="barra_estado">
          <div className={`barra_progreso fase_${fase}`} />
        </div>
      </div>
    </div>
  );
};
