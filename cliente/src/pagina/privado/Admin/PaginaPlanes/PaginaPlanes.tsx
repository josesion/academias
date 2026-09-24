import { useState } from "react";
import { FormularioPlanes } from "../../../../componentes/Administrador/PlanesSaas/FormularioPlanes";
import { ListadoPlanes } from "../../../../componentes/Administrador/ListadoPlanesSaas/ListadoPlanes";
import { type PlanSaasItem } from "../../../../componentes/Administrador/ListadoPlanesSaas/ListadoPlanes";

import { setAbmPlanes } from "../../../../hookNegocios/admin.plames";

import "./paginaplanes.css";

export const PaginaPlanes = () => {
  const [panelAbierto, setPanelAbierto] = useState(false);

  const { state, handleEditarPlan } = setAbmPlanes();

  return (
    <div className="pagina-planes-container">
      {/* Overlay para cerrar tocando afuera (solo mobile/cuando está abierto) */}
      {panelAbierto && (
        <div
          className="planes-overlay"
          onClick={() => setPanelAbierto(false)}
        />
      )}

      <aside className={`section-formulario ${panelAbierto ? "abierto" : ""}`}>
        <button
          className="lengueta-planes"
          onClick={() => setPanelAbierto((prev) => !prev)}
          aria-expanded={panelAbierto}
          aria-controls="panel-formulario-planes"
        >
          <span>Planes</span>
        </button>

        <div
          className="section-formulario-contenido"
          id="panel-formulario-planes"
        >
          <FormularioPlanes />
        </div>
      </aside>

      <div className="section-listado">
        <h2>Administración de Planes SaaS</h2>
        <ListadoPlanes
          planes={state.listadoPlan as PlanSaasItem[]}
          onSeleccionarPlan={handleEditarPlan}
        />
      </div>
    </div>
  );
};
