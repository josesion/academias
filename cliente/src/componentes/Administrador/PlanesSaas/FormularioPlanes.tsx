import "./formularioplanes.css";
import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";
import { CompoError } from "../../generales/Error/Error";
import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";
import { ListaCaracteristicas } from "../CaracteristicasPlanes/ListaCaracteristicasProps";

import { setAbmPlanes } from "../../../hookNegocios/admin.plames";

export type TipoPlanSaaS = "basico" | "intermedio" | "premium";

export interface PlanOpcion {
  id: TipoPlanSaaS;
  nombre: string;
}

export const PLANES_OPCIONES: PlanOpcion[] = [
  { id: "basico", nombre: "Básico" },
  { id: "intermedio", nombre: "Intermedio" },
  { id: "premium", nombre: "Premium" },
];

export const FormularioPlanes = () => {
  const {
    state,
    cachearFormulario,
    postPlanesSaas,
    cachearCaracateristicas,
    agregarCaracteristica,
  } = setAbmPlanes();

  return (
    <form className="form-planes-container" onSubmit={postPlanesSaas}>
      <div className="form-grid">
        <Inputs
          type="text"
          label="Nombre Plan Saas"
          placeholder="Ingrese el nombre"
          readonly={false}
          name={state.formulario.nombre_plan.nombre}
          value={state.formulario.nombre_plan.value}
          error={"nombre"}
          onChange={cachearFormulario}
        />

        <SelectorOpt
          categorias={PLANES_OPCIONES}
          itemKey="id"
          itemLabel="nombre"
          name={state.formulario.tipo.nombre}
          labelDefault="Seleccione un plan..."
          onChangeSelector={cachearFormulario}
        />

        <Inputs
          type="number"
          label="Precio"
          placeholder="Ingrese el precio"
          readonly={false}
          name={state.formulario.precio_plan.nombre}
          value={state.formulario.precio_plan.value}
          error={"precio"}
          onChange={cachearFormulario}
        />

        <Inputs
          type="number"
          label="Cantidad Flayers"
          placeholder="Cantidad Flayers"
          readonly={false}
          name={state.formulario.flayers_plan.nombre}
          value={state.formulario.flayers_plan.value}
          error={"flayers"}
          onChange={cachearFormulario}
        />
      </div>

      {/* Sección de Características Dinámicas */}
      <div className="caracteristicas-section">
        <h3 className="section-title">Características del Plan</h3>

        <div className="caracteristicas-inputs-grid">
          <Inputs
            type="text"
            label="Clave"
            placeholder="Ej: soporte"
            readonly={false}
            name={state.clavesValor.clave.nombre}
            value={state.clavesValor.clave.value}
            error={"clave"}
            onChange={cachearCaracateristicas}
          />

          <Inputs
            type="text"
            label="Valor"
            placeholder="Ej: 24/7"
            readonly={false}
            name={state.clavesValor.valor.nombre}
            value={state.clavesValor.valor.value}
            error={"valor"}
            onChange={cachearCaracateristicas}
          />
        </div>

        <div className="caracteristicas-btn-container">
          <Boton
            clase="agregar"
            texto="Agregar Característica"
            logo={"Add"}
            type="button"
            onClick={agregarCaracteristica}
          />
        </div>

        <div className="caracteristicas-list-wrapper">
          <ListaCaracteristicas caracteristicas={state.caracteristicas} />
        </div>
      </div>

      <div className="form-footer">
        <Boton
          clase="aceptar"
          texto="Guardar Plan"
          logo={"Go"}
          type="submit"
          disable={state.carga.post}
        />
      </div>

      {state.error.post && <CompoError mensaje={state.error.post} />}
    </form>
  );
};
