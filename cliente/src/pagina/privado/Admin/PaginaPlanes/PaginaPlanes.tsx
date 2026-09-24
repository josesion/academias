import { useState } from "react";
import { FormularioPlanes } from "../../../../componentes/Administrador/PlanesSaas/FormularioPlanes";
import { ListadoPlanes } from "../../../../componentes/Administrador/ListadoPlanesSaas/ListadoPlanes";
import { type PlanSaasItem } from "../../../../componentes/Administrador/ListadoPlanesSaas/ListadoPlanes";

import { setAbmPlanes } from "../../../../hookNegocios/admin.plames";

import "./paginaplanes.css";

export const PaginaPlanes = () => {
  const [panelAbierto, setPanelAbierto] = useState(false);

  const planesLogic = setAbmPlanes();
  const { state, dispatch, cachearEditarPlan, handleEditarPlan } = planesLogic;

  const cerrarPaleta = () => {
    setPanelAbierto(false);
    dispatch({ type: "LIMPIAR_TODO" });
  };

  return (
    <div className="pagina-planes-container">
      {/* Overlay para cerrar tocando afuera (solo mobile/cuando está abierto) */}
      {panelAbierto && (
        <div className="planes-overlay" onClick={cerrarPaleta} />
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
          <FormularioPlanes
            state={state}
            cachearFormulario={planesLogic.cachearFormulario}
            postPlanesSaas={planesLogic.postPlanesSaas}
            cachearCaracateristicas={planesLogic.cachearCaracateristicas}
            agregarCaracteristica={planesLogic.agregarCaracteristica}
            editarPlan={handleEditarPlan}
          />
        </div>
      </aside>

      <div className="section-listado">
        <h2>Administración de Planes SaaS</h2>
        <ListadoPlanes
          planes={state.listadoPlan as PlanSaasItem[]}
          onSeleccionarPlan={cachearEditarPlan}
        />
      </div>
    </div>
  );
};
