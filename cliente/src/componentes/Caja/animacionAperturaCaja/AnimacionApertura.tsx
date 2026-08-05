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
      <div className={`card_apertura ${fase === 3 ? "finalizada" : ""}`}>
        <div className="estado_icono">
          {fase < 3 ? (
            <div className="spinner_estado">
              <FaPowerOff />
            </div>
          ) : (
            <div className="icono_ok">
              <FaUnlock />
            </div>
          )}
        </div>

        <div className="contenido_estado">
          <span className="estado_pequeño">Sistema de Caja</span>

          <h2>
            {fase === 1 && "Inicializando..."}

            {fase === 2 && "Validando permisos..."}

            {fase === 3 && "Caja abierta correctamente"}
          </h2>

          <p>
            {fase === 1 && "Preparando el entorno de trabajo"}

            {fase === 2 && "Comprobando credenciales y permisos"}

            {fase === 3 && `Bienvenido ${usuario ?? "Operador"}`}
          </p>
        </div>

        <div className="barra_estado">
          <div className={`barra_progreso fase_${fase}`} />
        </div>
      </div>
    </div>
  );
};
