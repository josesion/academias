// EstadoVacio.tsx
import "./EstadoVacio.css";

type VarianteVacio = "escuela" | "flayers" | "inscripcion" | "planes";

interface EstadoVacioProps {
  variante: VarianteVacio;
  mensaje?: string;
  accion?: {
    texto: string;
    onClick: () => void;
  };
}

const mensajesDefault: Record<VarianteVacio, string> = {
  escuela: "Todavía no cargaste los datos de tu academia.",
  flayers: "No hay novedades o anuncios publicados por el momento.",
  inscripcion: "No tenés un plan activo en esta academia.",
  planes: "Esta academia todavía no publicó planes disponibles.",
};

export const EstadoVacio = ({
  variante,
  mensaje,
  accion,
}: EstadoVacioProps) => {
  return (
    <div className={`estado-vacio-contenedor estado-vacio--${variante}`}>
      <div className="estado-vacio-ilustracion">
        <IlustracionVacio variante={variante} />
      </div>
      <p className="estado-vacio-mensaje">
        {mensaje ?? mensajesDefault[variante]}
      </p>
      {accion && (
        <button className="estado-vacio-boton" onClick={accion.onClick}>
          {accion.texto}
        </button>
      )}
    </div>
  );
};

const IlustracionVacio = ({ variante }: { variante: VarianteVacio }) => {
  switch (variante) {
    case "escuela":
      return <IlustracionEscuela />;
    case "flayers":
      return <IlustracionFlayers />;
    case "inscripcion":
      return <IlustracionInscripcion />;
    case "planes":
      return <IlustracionPlanes />;
  }
};

/* --- Escuela: fachada de academia con puerta, esperando datos --- */
const IlustracionEscuela = () => (
  <svg viewBox="0 0 120 100" width="88" height="74" fill="none">
    <path
      d="M20 92V45L60 18L100 45V92"
      stroke="var(--texto-deshabilitado)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect x="12" y="90" width="96" height="4" rx="2" fill="var(--borde)" />
    <rect
      x="50"
      y="60"
      width="20"
      height="32"
      rx="2"
      stroke="var(--color-secundario)"
      strokeWidth="2.5"
    />
    <circle cx="65" cy="76" r="1.6" fill="var(--color-secundario)" />
    <rect
      x="30"
      y="50"
      width="14"
      height="14"
      rx="2"
      stroke="var(--texto-deshabilitado)"
      strokeWidth="2"
    />
    <rect
      x="76"
      y="50"
      width="14"
      height="14"
      rx="2"
      stroke="var(--texto-deshabilitado)"
      strokeWidth="2"
    />
    <path
      d="M60 18L60 8"
      stroke="var(--color-advertencia)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d="M60 8 L72 12 L60 16 Z" fill="var(--color-advertencia)" />
  </svg>
);

/* --- Flayers: tarjetas apiladas ligeramente desprolijas, vacías --- */
const IlustracionFlayers = () => (
  <svg viewBox="0 0 120 100" width="88" height="74" fill="none">
    <rect
      x="18"
      y="38"
      width="60"
      height="42"
      rx="6"
      transform="rotate(-6 18 38)"
      fill="var(--fondo-secundario)"
      stroke="var(--borde)"
      strokeWidth="2"
    />
    <rect
      x="30"
      y="30"
      width="60"
      height="42"
      rx="6"
      transform="rotate(4 30 30)"
      fill="var(--fondo-secundario)"
      stroke="var(--borde)"
      strokeWidth="2"
    />
    <rect
      x="26"
      y="26"
      width="62"
      height="44"
      rx="6"
      fill="var(--fondo-secundario)"
      stroke="var(--texto-deshabilitado)"
      strokeWidth="2.5"
    />
    <line
      x1="36"
      y1="40"
      x2="70"
      y2="40"
      stroke="var(--color-advertencia)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="36"
      y1="50"
      x2="78"
      y2="50"
      stroke="var(--borde)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="36"
      y1="58"
      x2="64"
      y2="58"
      stroke="var(--borde)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* --- Inscripción: carnet/ticket con espacio vacío en vez de datos --- */
const IlustracionInscripcion = () => (
  <svg viewBox="0 0 120 100" width="88" height="74" fill="none">
    <rect
      x="20"
      y="30"
      width="80"
      height="48"
      rx="8"
      fill="var(--fondo-secundario)"
      stroke="var(--texto-deshabilitado)"
      strokeWidth="2.5"
    />
    <circle
      cx="38"
      cy="48"
      r="9"
      stroke="var(--color-secundario)"
      strokeWidth="2.2"
      strokeDasharray="3 3"
    />
    <line
      x1="55"
      y1="44"
      x2="82"
      y2="44"
      stroke="var(--borde)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="55"
      y1="52"
      x2="72"
      y2="52"
      stroke="var(--borde)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="66"
      x2="92"
      y2="66"
      stroke="var(--borde)"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
    <path
      d="M85 26 L92 19 M92 26 L85 19"
      stroke="var(--color-advertencia)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

/* --- Planes: lista/checklist con casilleros sin marcar --- */
const IlustracionPlanes = () => (
  <svg viewBox="0 0 120 100" width="88" height="74" fill="none">
    <rect
      x="24"
      y="20"
      width="72"
      height="60"
      rx="8"
      fill="var(--fondo-secundario)"
      stroke="var(--texto-deshabilitado)"
      strokeWidth="2.5"
    />
    {[32, 48, 64].map((y) => (
      <g key={y}>
        <rect
          x="34"
          y={y}
          width="10"
          height="10"
          rx="2.5"
          stroke="var(--borde)"
          strokeWidth="2"
        />
        <line
          x1="52"
          y1={y + 5}
          x2="84"
          y2={y + 5}
          stroke="var(--borde)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    ))}
    <circle
      cx="39"
      cy="37"
      r="1.6"
      fill="var(--color-secundario)"
      opacity="0.5"
    />
  </svg>
);
