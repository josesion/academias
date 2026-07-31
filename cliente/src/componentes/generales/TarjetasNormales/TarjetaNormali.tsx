import "./tarjeta_notmal.css";
import CountUp from "react-countup"; // Importamos el animador

interface TarjetaProps {
  titulo: string;
  monto: number;
  claseColor?: "azul" | "verde" | "rojo" | "negro";
  icono?: React.ReactNode;
}

export const TarjetasNormales = ({
  titulo,
  monto,
  claseColor,
  icono,
}: TarjetaProps) => {
  return (
    <div className={`tarjeta_normal_contenedor ${claseColor}`}>
      <div className="tarjeta_header">
        <span>{titulo}</span>
        {icono && <div className="tarjeta_icono">{icono}</div>}
      </div>
      <div className="tarjeta_monto">
        ${" "}
        <CountUp
          end={monto}
          duration={1.5} // Cuánto tarda en subir (segundos)
          separator="." // Separador de miles
          decimal="," // Separador de decimales
          preserveValue={true} // Para que si cambia de 100 a 150, empiece desde el 100
        />
      </div>
    </div>
  );
};
