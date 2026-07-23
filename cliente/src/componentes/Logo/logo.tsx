import "./logo.css";
import logoImage from "./logo.png";

type LogoProps = {
  size?: number; // Representará el ancho en este formato horizontal
};

export const Logo = ({ size = 180 }: LogoProps) => {
  return (
    <div
      className="logo_contenedor"
      style={{
        width: `${size}px`,
      }}
    >
      <div className="logo_resplandor"></div>

      <img
        src={logoImage}
        alt="Logo Elpis"
        className="logo_imagen"
        // Relación de aspecto aproximada para el logo horizontal (ej: 4:1 -> 180x45)
        width={size}
        height={Math.round(size / 4)}
        loading="eager" // Al ser navbar, carga inmediata
        fetchPriority="high" // Máxima prioridad de red
      />
    </div>
  );
};
