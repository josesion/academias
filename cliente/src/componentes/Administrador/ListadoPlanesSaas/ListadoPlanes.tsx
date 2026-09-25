import React from "react";
import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";
import "./listadoplanes.css";

// Tipado basado en tu tabla planes_saas
export interface PlanSaasItem {
  id_plan: number;
  tipo: string;
  descripcion: string;
  precio: number;
  cant_flyers: number;
  caracteristicas: Record<string, any> | null | string; // El JSON de la base de datos
  estado: string;
}

const opcionesEstadoPlanes = [
  { id: "activo", nombre: "Activo" },
  { id: "inactivo", nombre: "Inactivo" },
];

interface PlanInfoGeneralProps {
  plan: PlanSaasItem;
  onEditar?: (plan: PlanSaasItem) => void;
  onCambiarEstado?: (plan: PlanSaasItem) => void;
}

// -----------------------------------------------------------------
// Subcomponente 1: Información General (Izquierda)
// -----------------------------------------------------------------
export const PlanInfoGeneral: React.FC<PlanInfoGeneralProps> = ({
  plan,
  onEditar,
  onCambiarEstado,
}) => {
  const textoBoton = plan.estado === "activo" ? "Dar de baja" : "Dar de alta";

  return (
    <div
      className="plan-info-general"
      onClick={() => onEditar && onEditar(plan)} // Dispara la función al hacer clic con este plan
      style={{ cursor: onEditar ? "pointer" : "default" }}
    >
      <div className="plan-header-row">
        <span className={`plan-badge ${plan.tipo}`}>
          {plan.tipo.toUpperCase()}
        </span>
        <span className={`plan-estado ${plan.estado}`}>{plan.estado}</span>
      </div>

      <h3 className="plan-descripcion">{plan.descripcion}</h3>

      <div className="plan-metrics">
        <div className="metric-item">
          <span className="metric-label">Precio:</span>
          <span className="metric-value">
            $ {Number(plan.precio).toLocaleString()}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Flyers:</span>
          <span className="metric-value">{plan.cant_flyers}</span>
        </div>
      </div>

      <button
        type="button"
        className="plan-toggle-estado"
        onClick={(e) => {
          e.stopPropagation();
          onCambiarEstado?.(plan);
        }}
      >
        {textoBoton}
      </button>
    </div>
  );
};

// -----------------------------------------------------------------
// Subcomponente 2: Características JSON Blindado (Derecha)
// -----------------------------------------------------------------
export const PlanCaracteristicas: React.FC<{ caracteristicas: any }> = ({
  caracteristicas,
}) => {
  let parsedData = caracteristicas;

  if (typeof caracteristicas === "string") {
    try {
      parsedData = JSON.parse(caracteristicas);
      if (typeof parsedData === "string") {
        parsedData = JSON.parse(parsedData);
      }
    } catch (e) {
      console.error("Error al parsear características:", e);
      parsedData = null;
    }
  }

  if (!parsedData) {
    return (
      <div className="plan-caracteristicas empty">
        <p>Sin características detalladas</p>
      </div>
    );
  }

  // CASO A: Es un Array (ej: Plan 10 -> [{clave: '...', valor: '...'}])
  if (Array.isArray(parsedData)) {
    return (
      <div className="plan-caracteristicas">
        <h4 className="caracteristicas-titulo">Características</h4>
        <ul className="caracteristicas-list">
          {parsedData.map((item, index) => {
            if (typeof item === "object" && item !== null) {
              const clave =
                item.clave || item.titulo || item.texto || "Detalle";
              const valor = item.valor || item.descripcion || "";
              return (
                <li key={index} className="caracteristica-item">
                  <span className="carac-key">{String(clave)}:</span>
                  <span className="carac-val">{String(valor)}</span>
                </li>
              );
            }
            return (
              <li key={index} className="caracteristica-item">
                <span className="carac-val">{String(item)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // CASO B: Es un Objeto con { titulo: '...', items: [...] } (ej: Planes 8 y 9)
  if (typeof parsedData === "object" && parsedData !== null) {
    const titulo = parsedData.titulo;
    const items = parsedData.items;

    if (Array.isArray(items)) {
      return (
        <div className="plan-caracteristicas">
          {titulo && <h4 className="caracteristicas-titulo">{titulo}</h4>}
          <ul className="caracteristicas-list">
            {items.map((item: any, index: number) => (
              <li key={index} className="caracteristica-item">
                <span
                  className={`carac-val ${item.disponible === false ? "no-disponible" : ""}`}
                >
                  {item.texto || String(item)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // CASO C: Es un objeto clave-valor plano tradicional
    return (
      <div className="plan-caracteristicas">
        <h4 className="caracteristicas-titulo">Características</h4>
        <ul className="caracteristicas-list">
          {Object.entries(parsedData).map(([key, value], index) => (
            <li key={index} className="caracteristica-item">
              <span className="carac-key">{key}:</span>
              <span className="carac-val">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

// -----------------------------------------------------------------
// Componente Principal: ListadoPlanes
// -----------------------------------------------------------------
interface ListadoPlanesProps {
  planes: PlanSaasItem[];
  onSeleccionarPlan?: (plan: PlanSaasItem) => void;
  onCambiarEstado?: (plan: PlanSaasItem) => void;
}

export const ListadoPlanes: React.FC<ListadoPlanesProps> = ({
  planes,
  onSeleccionarPlan,
  onCambiarEstado,
}) => {
  if (!planes || planes.length === 0) {
    return (
      <div className="listado-vacio">
        <p>No hay planes registrados en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="listado-planes-container">
      {planes.map((plan) => (
        <div key={plan.id_plan} className="plan-card-row">
          <PlanInfoGeneral
            plan={plan}
            onEditar={onSeleccionarPlan}
            onCambiarEstado={onCambiarEstado}
          />
          <div className="plan-divider"></div>
          <PlanCaracteristicas caracteristicas={plan.caracteristicas} />
        </div>
      ))}
    </div>
  );
};
