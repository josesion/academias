import { useState } from "react";
import { FormularioPlanes } from "../../../../componentes/Administrador/PlanesSaas/FormularioPlanes";
import { ListadoPlanes } from "../../../../componentes/Administrador/ListadoPlanesSaas/ListadoPlanes";
import { EliminarVentana } from "../../../../componentes/generales/EliminarModal/EliminarModal";
import { SelectorOpt } from "../../../../componentes/generales/CompSelecObt/SelectorOpt";

import { type PlanSaasItem } from "../../../../componentes/Administrador/ListadoPlanesSaas/ListadoPlanes";

import { setAbmPlanes } from "../../../../hookNegocios/admin.plames";

import "./paginaplanes.css";

const opcionesEstadoPlanes = [
  { id: "activo", nombre: "Activo" },
  { id: "inactivo", nombre: "Inactivo" },
];

export const PaginaPlanes = () => {
  const [panelAbierto, setPanelAbierto] = useState(false);

  const planesLogic = setAbmPlanes();
  const {
    state,
    dispatch,
    cachearEditarPlan,
    handleEditarPlan,
    cachearEstadoPlan,
    cambiarEstadoPlan,
    cerrarModalEstado,
    cachearEstadoLista,
  } = planesLogic;

  const cerrarPaleta = () => {
    setPanelAbierto(false);
    dispatch({ type: "LIMPIAR_TODO" });
  };

  const textoConfirmacion =
    state.planSeleccionado.estado === "activo"
      ? "dar de baja este plan SaaS"
      : "dar de alta este plan SaaS";

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

        <div className="planes-filtro-estado">
          <SelectorOpt
            categorias={opcionesEstadoPlanes}
            itemKey="id"
            itemLabel="nombre"
            name="estado"
            value={state.filtroEstado ?? ""}
            labelDefault="Filtrar por estado"
            onChangeSelector={cachearEstadoLista}
          />
        </div>

        <ListadoPlanes
          planes={state.listadoPlan as PlanSaasItem[]}
          onSeleccionarPlan={cachearEditarPlan}
          onCambiarEstado={cachearEstadoPlan}
        />
      </div>

      {state.modalEstado && (
        <div className="planes-modal-backdrop" onClick={cerrarModalEstado}>
          <div
            className="planes-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <EliminarVentana
              data={{ id: state.planSeleccionado.id_plan ?? 0 }}
              onSi={() => cambiarEstadoPlan()}
              onCancelar={cerrarModalEstado}
              accion={textoConfirmacion}
              cargando={state.carga.post}
            />
          </div>
        </div>
      )}
    </div>
  );
};
