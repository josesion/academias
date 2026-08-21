import React from "react";
import CountUp from "react-countup";
import "./tarjeta_notmal.css";

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
  // Separamos la parte entera y los decimales del número de forma nativa
  const parteEntera = Math.floor(monto);
  const decimales = Math.round((monto - parteEntera) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <div className={`tarjeta_normal_contenedor ${claseColor || ""}`}>
      <div className="tarjeta_header">
        <span className="tarjeta_titulo">{titulo}</span>
        {icono && <div className="tarjeta_icono">{icono}</div>}
      </div>
      <div className="tarjeta_monto_wrapper">
        <span className="tarjeta_simbolo">$</span>

        {/* CountUp solo anima la parte entera limpiamente */}
        <CountUp
          end={parteEntera}
          duration={1.5}
          separator="."
          preserveValue={true}
          className="monto_entero"
        />

        {/* Los decimales van al lado con su clase para achicarlos y desvanecerlos */}
        <span className="monto_decimal">,{decimales}</span>
      </div>
    </div>
  );
};
