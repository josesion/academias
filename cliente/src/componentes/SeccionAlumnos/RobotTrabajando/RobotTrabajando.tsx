// RobotTrabajando.tsx
import "./RobotTrabajando.css";

interface RobotTrabajandoProps {
  mensaje: string;
  onCerrar?: () => void;
}

export const RobotTrabajando = ({
  mensaje,
  onCerrar,
}: RobotTrabajandoProps) => {
  return (
    <div className="robot_trabajo_contenedor">
      {onCerrar && (
        <button
          className="robot_trabajo_cerrar"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      )}

      <div className="robot_trabajo_glow" />

      <svg
        className="robot_trabajo_svg"
        viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antena con luz de "trabajando" */}
        <line
          x1="110"
          y1="48"
          x2="110"
          y2="28"
          stroke="#7d8cff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          className="robot_trabajo_antena_luz"
          cx="110"
          cy="24"
          r="5"
          fill="#5bffe0"
        />

        {/* Cabeza */}
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

        {/* Ojos tranquilos, parpadeando alternado */}
        <circle
          className="robot_trabajo_ojo robot_trabajo_ojo_1"
          cx="98"
          cy="81"
          r="6.5"
          fill="#5bffe0"
        />
        <circle
          className="robot_trabajo_ojo robot_trabajo_ojo_2"
          cx="122"
          cy="81"
          r="6.5"
          fill="#5bffe0"
        />

        {/* Boca: leve curva, no plana, más "concentrado" que "roto" */}
        <path
          d="M96 97 Q110 102 124 97"
          stroke="#7d8cff"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Cuello */}
        <rect
          x="100"
          y="120"
          width="20"
          height="10"
          fill="#1b1f2e"
          stroke="#5b6bff"
          strokeWidth="1.5"
        />

        {/* Torso */}
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

        {/* Engranaje girando en el torso */}
        <g
          className="robot_trabajo_engranaje"
          style={{ transformOrigin: "110px 160px" }}
        >
          <circle
            cx="110"
            cy="160"
            r="14"
            fill="none"
            stroke="#ffd166"
            strokeWidth="3"
          />
          <circle cx="110" cy="160" r="4" fill="#ffd166" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1="110"
              y1="160"
              x2="110"
              y2="144"
              stroke="#ffd166"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${deg} 110 160)`}
            />
          ))}
        </g>

        {/* Luces auxiliares del torso */}
        <circle
          className="robot_trabajo_luz robot_trabajo_luz_1"
          cx="80"
          cy="175"
          r="4"
          fill="#5bffe0"
        />
        <circle
          className="robot_trabajo_luz robot_trabajo_luz_2"
          cx="140"
          cy="175"
          r="4"
          fill="#5b6bff"
        />

        {/* Brazo con llave inglesa, moviéndose */}
        <g className="robot_trabajo_brazo">
          <rect
            x="150"
            y="140"
            width="14"
            height="38"
            rx="6"
            fill="#1b1f2e"
            stroke="#5b6bff"
            strokeWidth="2"
          />
          <g
            className="robot_trabajo_llave"
            style={{ transformOrigin: "168px 148px" }}
          >
            <rect
              x="163"
              y="122"
              width="7"
              height="30"
              rx="3"
              fill="#ffd166"
              transform="rotate(25 166.5 137)"
            />
            <circle
              cx="171"
              cy="120"
              r="6"
              fill="none"
              stroke="#ffd166"
              strokeWidth="3"
            />
          </g>
        </g>

        {/* Brazo apoyado */}
        <rect
          x="45"
          y="140"
          width="14"
          height="42"
          rx="6"
          fill="#1b1f2e"
          stroke="#5b6bff"
          strokeWidth="2"
        />
      </svg>

      <div className="robot_trabajo_texto">
        <p className="robot_trabajo_mensaje">{mensaje}</p>
        <div className="robot_trabajo_progreso">
          <div className="robot_trabajo_progreso_fill" />
        </div>
      </div>
    </div>
  );
};
