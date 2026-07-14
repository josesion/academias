import "./tarjetametricas.css";
import CountUp from "react-countup";

import {
  LuUsers,
  LuUserRoundPlus,
  LuTriangleAlert,
  LuClock3,
  LuWallet,
  LuArrowUp,
  LuArrowDown,
  LuMinus,
} from "react-icons/lu";

import { SpinnerTarjeta } from "../SipinnerMetricas/SpinnerTajetas";

export interface MetricasProps {
  carga: boolean;
  titulo: string;
  valor: number;
  porcentaje?: number;
  tipo: "activos" | "nuevos" | "vencidos" | "por_vencer" | "caja";
  leyenda?: string;
}

const iconos = {
  activos: <LuUsers size={34} />,
  nuevos: <LuUserRoundPlus size={34} />,
  vencidos: <LuTriangleAlert size={34} />,
  por_vencer: <LuClock3 size={34} />,
  caja: <LuWallet size={34} />,
};

export const TarjetaMetrica = ({
  carga,
  titulo,
  valor,
  porcentaje,
  tipo,
  leyenda,
}: MetricasProps) => {
  const tieneDetalle = porcentaje !== undefined || leyenda !== undefined;

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
      {carga ? (
        <SpinnerTarjeta />
      ) : (
        <div
          className={`tarjeta_metrica_contenido ${
            !tieneDetalle ? "centrado" : ""
          }`}
        >
          <div className="tarjeta_metrica_logo">{iconos[tipo]}</div>

          <div
            className={`tarjeta_metrica_info ${
              !tieneDetalle ? "centrado" : ""
            }`}
          >
            <p className="tarjeta_metrica_titulo">{titulo}</p>

            <p className="tarjeta_metrica_valor">
              <CountUp
                end={valor}
                duration={1.5}
                separator="."
                decimal=","
                preserveValue
              />
            </p>

            {porcentaje !== undefined && (
              <p className={`tarjeta_metrica_porcentaje ${clasePorcentaje}`}>
                {iconoPorcentaje}
                {Math.abs(porcentaje)}% vs mes pasado
              </p>
            )}

            {leyenda && <p className="tarjeta_metrica_leyenda">{leyenda}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
