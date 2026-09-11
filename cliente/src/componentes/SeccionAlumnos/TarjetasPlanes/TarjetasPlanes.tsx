import React from "react";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import "./planesescuela.css";

export interface PlanEscuelaData {
  id_plan: number;
  descripcion_plan: string;
  cantidad_clases: number;
  cantidad_meses: number;
  monto: number;
  estado: string;
}

interface PlanesEscuelaListProps {
  planes: PlanEscuelaData[];
  idPlanActual?: number; // Para marcar cuál tiene contratado el alumno actualmente
  onSeleccionarPlan?: (idPlan: number) => void;
  carga: boolean;
}

export const PlanesEscuelaList: React.FC<PlanesEscuelaListProps> = ({
  planes,
  idPlanActual,
  carga,
}) => {
  // Función para formatear el monto en pesos argentinos
  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(monto);
  };

  return (
    <div className="seccion-bloque">
      <h2 className="seccion-titulo">Planes Disponibles en la Academia</h2>

      {carga ? (
        <SpinnerTarjeta />
      ) : (
        <>
          <div className="grilla-planes">
            {planes.map((plan) => {
              const esActivo = plan.id_plan === idPlanActual;

              return (
                <div
                  key={plan.id_plan}
                  className={`plan-card ${esActivo ? "activo" : ""}`}
                >
                  {esActivo && (
                    <span className="badge-plan-activo">Tu Plan Actual</span>
                  )}

                  <h3 className="plan-nombre">{plan.descripcion_plan}</h3>

                  <div className="plan-precio">
                    {formatearMonto(plan.monto)}{" "}
                    <span>
                      /{" "}
                      {plan.cantidad_meses > 0
                        ? plan.cantidad_meses === 1
                          ? "mes"
                          : `${plan.cantidad_meses} meses`
                        : "clase"}
                    </span>
                  </div>

                  <ul className="plan-lista">
                    <li>
                      {plan.cantidad_clases > 22
                        ? "Clases ilimitadas"
                        : `${plan.cantidad_clases} clases incluidas`}
                    </li>
                    <li>
                      {plan.cantidad_clases > 0
                        ? `Vigencia de ${plan.cantidad_meses} mes/es`
                        : "Pago por única vez"}
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
