// RobotError.tsx
import "./RobotError.css";

interface RobotErrorProps {
  mensaje: string;
  onReintentar?: () => void;
  onCerrar?: () => void;
}

export const RobotError = ({
  mensaje,
  onReintentar,
  onCerrar,
}: RobotErrorProps) => {
  return (
    <div className="robot_error_contenedor">
      {onCerrar && (
        <button
          className="robot_error_cerrar"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      )}

      <div className="robot_error_glow" />

      <svg
        className="robot_error_svg"
        viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cables sueltos detrás */}
        <path
          className="robot_cable robot_cable_1"
          d="M60 120 Q30 140 40 170"
          stroke="#5b6bff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          className="robot_cable robot_cable_2"
          d="M160 120 Q195 135 185 168"
          stroke="#8a5bff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Antena rota */}
        <line
          className="robot_antena"
          x1="130"
          y1="35"
          x2="150"
          y2="10"
          stroke="#7d8cff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          className="robot_antena_punta"
          cx="150"
          cy="10"
          r="4"
          fill="#ff5b7d"
        />

        {/* Cuerpo */}
        <g className="robot_cuerpo">
          <rect
            x="65"
            y="50"
            width="90"
            height="70"
            rx="14"
            fill="#1b1f2e"
            stroke="#5b6bff"
            strokeWidth="2"
          />
          <rect
            x="78"
            y="63"
            width="64"
            height="40"
            rx="8"
            fill="#0d0f18"
            stroke="rgba(123,140,255,0.3)"
          />

          <g className="robot_ojo_x">
            <line
              x1="90"
              y1="75"
              x2="102"
              y2="87"
              stroke="#ff5b7d"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="102"
              y1="75"
              x2="90"
              y2="87"
              stroke="#ff5b7d"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          <circle
            className="robot_ojo_bueno"
            cx="128"
            cy="81"
            r="7"
            fill="#5bffe0"
          />

          <rect
            x="92"
            y="95"
            width="36"
            height="4"
            rx="2"
            fill="#7d8cff"
            opacity="0.6"
          />

          <circle
            className="robot_tornillo"
            cx="150"
            cy="60"
            r="4"
            fill="#8a5bff"
          />

          <rect
            x="100"
            y="120"
            width="20"
            height="10"
            fill="#1b1f2e"
            stroke="#5b6bff"
            strokeWidth="1.5"
          />

          <rect
            x="55"
            y="130"
            width="110"
            height="60"
            rx="12"
            fill="#1b1f2e"
            stroke="#5b6bff"
            strokeWidth="2"
          />

          <circle
            className="robot_luz robot_luz_1"
            cx="80"
            cy="155"
            r="5"
            fill="#5bffe0"
          />
          <circle
            className="robot_luz robot_luz_2"
            cx="98"
            cy="155"
            r="5"
            fill="#ff5b7d"
          />
          <circle
            className="robot_luz robot_luz_3"
            cx="116"
            cy="155"
            r="5"
            fill="#8a5bff"
          />

          <path
            d="M140 135 L150 155 L142 158 L155 178"
            stroke="#ff5b7d"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />

          <rect
            className="robot_brazo"
            x="35"
            y="140"
            width="14"
            height="45"
            rx="6"
            fill="#1b1f2e"
            stroke="#5b6bff"
            strokeWidth="2"
          />
        </g>

        <circle
          className="robot_chispa robot_chispa_1"
          cx="150"
          cy="150"
          r="2.5"
          fill="#ffdd5b"
        />
        <circle
          className="robot_chispa robot_chispa_2"
          cx="158"
          cy="140"
          r="2"
          fill="#ffdd5b"
        />
        <circle
          className="robot_chispa robot_chispa_3"
          cx="145"
          cy="165"
          r="2"
          fill="#5bffe0"
        />
      </svg>

      <div className="robot_error_texto">
        <p className="robot_error_mensaje">{mensaje}</p>

        {onReintentar && (
          <button className="robot_error_boton" onClick={onReintentar}>
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};
