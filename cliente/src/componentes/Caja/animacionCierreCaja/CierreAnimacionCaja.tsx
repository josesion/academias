import { useEffect, useState } from "react";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import "./cierreanimacioncaja.css";

interface AnimacionCierreProps {
  onFinished?: () => void;
  montoFinal?: number;
}

export const AnimacionCierreExitoso = ({
  onFinished,
  montoFinal,
}: AnimacionCierreProps) => {
  const [fase, setFase] = useState(1);

  useEffect(() => {
    // Fase 1: Sincronizando (0ms a 700ms)
    // Fase 2: Encriptando (700ms a 1500ms)
    // Fase 3: Éxito (1500ms en adelante)

    const timer1 = setTimeout(() => setFase(2), 700); // Antes 1500
    const timer2 = setTimeout(() => setFase(3), 1500); // Antes 3000

    const timer3 = setTimeout(() => {
      if (onFinished) onFinished();
    }, 3200); // Antes 5000 (le damos un tiempo para que lean el monto final)

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinished]);

  return (
    <div className="overlay_animacion_cierre">
      <div className={`contenedor_escudo ${fase === 3 ? "exito" : ""}`}>
        {fase < 3 ? (
          <div className={`candado_cyber ${fase === 2 ? "procesando" : ""}`}>
            <FaLock />
            <div className="scanner_line"></div>
          </div>
        ) : (
          <div className="check_cyber">
            <FaCheckCircle />
          </div>
        )}

        <div className="textos_animacion">
          <h2 className={fase === 3 ? "texto_brillante" : ""}>
            {fase === 1 && "Sincronizando Cuentas..."}
            {fase === 2 && "Encriptando Cierre..."}
            {fase === 3 && "¡Caja Cerrada!"}
          </h2>
          {fase === 3 && montoFinal !== undefined && (
            <p className="monto_final_anim">
              Balance Final: $ {montoFinal.toLocaleString("es-AR")}
            </p>
          )}
        </div>

        {/* Partículas de fondo solo en éxito */}
        {fase === 3 && <div className="particulas_exito"></div>}
      </div>
    </div>
  );
};
