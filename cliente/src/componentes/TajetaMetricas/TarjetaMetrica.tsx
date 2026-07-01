import "./tarjetametricas.css";
import CountUp from "react-countup";

import {
  LuUsers,
  LuUserRoundPlus,
  LuTriangleAlert,
  LuClock3,
  LuArrowUp,
  LuArrowDown,
  LuMinus,
} from "react-icons/lu";

export interface MetricasProps {
  titulo: string;
  valor: number;
  porcentaje?: number;
  tipo: "activos" | "nuevos" | "vencidos" | "por_vencer";
}

const iconos = {
  activos: <LuUsers size={34} />,
  nuevos: <LuUserRoundPlus size={34} />,
  vencidos: <LuTriangleAlert size={34} />,
  por_vencer: <LuClock3 size={34} />,
};

export const TarjetaMetrica = ({
  titulo,
  valor,
  porcentaje, // Si no viene, será undefined
  tipo,
}: MetricasProps) => {
  // Solo calculamos si porcentaje existe
  const iconoPorcentaje =
    porcentaje !== undefined ? (
      porcentaje > 0 ? (
        <LuArrowUp size={16} />
      ) : porcentaje < 0 ? (
        <LuArrowDown size={16} />
      ) : (
        <LuMinus size={16} />
      )
    ) : null;

  const clasePorcentaje =
    porcentaje !== undefined
      ? porcentaje > 0
        ? "positivo"
        : porcentaje < 0
          ? "negativo"
          : "neutro"
      : "";

  return (
    <div className={`tarjeta_metrica_contenedor ${tipo}`}>
      <div className="tarjeta_metrica_logo">{iconos[tipo]}</div>

      <div className="tarjeta_metrica_info">
        <p className="tarjeta_metrica_titulo">{titulo}</p>
        <p className="tarjeta_metrica_valor">
          {" "}
          <CountUp
            end={valor}
            duration={1.5} // Cuánto tarda en subir (segundos)
            separator="." // Separador de miles
            decimal="," // Separador de decimales
            preserveValue={true} // Para que si cambia de 100 a 150, empiece desde el 100
          />
        </p>

        {/* Renderizado condicional: solo muestra el párrafo si porcentaje existe */}
        {porcentaje !== undefined && (
          <p className={`tarjeta_metrica_porcentaje ${clasePorcentaje}`}>
            {iconoPorcentaje}
            {Math.abs(porcentaje)}% vs mes pasado
          </p>
        )}
      </div>
    </div>
  );
};
