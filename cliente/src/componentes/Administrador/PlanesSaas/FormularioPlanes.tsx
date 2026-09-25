import "./formularioplanes.css";
import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";
import { CompoError } from "../../generales/Error/Error";
import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";
import { ListaCaracteristicas } from "../CaracteristicasPlanes/ListaCaracteristicasProps";
import type { PlanesSassTipado } from "../../../reducers/planes.saas.reducer";

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

interface FormularioPlanesProps {
  state: PlanesSassTipado;
  cachearFormulario: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  postPlanesSaas: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  cachearCaracateristicas: (event: React.ChangeEvent<HTMLInputElement>) => void;
  agregarCaracteristica: () => void;
  editarPlan?: () => void;
}

export const FormularioPlanes = ({
  state,
  cachearFormulario,
  postPlanesSaas,
  cachearCaracateristicas,
  agregarCaracteristica,
  editarPlan,
}: FormularioPlanesProps) => {
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
          error={""}
          onChange={cachearFormulario}
        />

        <SelectorOpt
          categorias={PLANES_OPCIONES}
          itemKey="id"
          itemLabel="nombre"
          name={state.formulario.tipo.nombre}
          value={state.formulario.tipo.value}
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
          error={""}
          onChange={cachearFormulario}
        />

        <Inputs
          type="number"
          label="Cantidad Flayers"
          placeholder="Cantidad Flayers"
          readonly={false}
          name={state.formulario.flayers_plan.nombre}
          value={state.formulario.flayers_plan.value}
          error={""}
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
            error={""}
            onChange={cachearCaracateristicas}
          />

          <Inputs
            type="text"
            label="Valor"
            placeholder="Ej: 24/7"
            readonly={false}
            name={state.clavesValor.valor.nombre}
            value={state.clavesValor.valor.value}
            error={""}
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
        {state.botonesVisibles.modificar ? (
          <Boton
            clase="editar"
            texto="Editar Plan Saas"
            disable={state.carga.post}
            type="button"
            logo="Edit"
            onClick={editarPlan}
          />
        ) : (
          <Boton
            clase="aceptar"
            texto="Guardar Plan"
            logo={"Go"}
            type="submit"
            disable={state.carga.post}
          />
        )}
      </div>

      {state.error.post && <CompoError mensaje={state.error.post} />}
    </form>
  );
};
