import "./formulariosuscripcion.css";

import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";
import { CompoError } from "../../generales/Error/Error";
import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";

import type { CeldasInput } from "../../../reducers/suspcripciones";
import type {
  EscuelaSelect,
  PlanSaasRow,
} from "../../../servicio/suspcripciones.fetch";

/* ==========================================================================
   FORMULARIO DE SUSCRIPCIONES (POST / PUT)

   Presentacional: recibe todo por props, no toca el estado.
   Elige POST o PUT según `metodo`, igual que FormularioEscuelas.
   ========================================================================== */

/** Claves exactas del formulario en el reducer de suscripciones */
export interface FormularioSuscripcionTipado {
  id_escuela: CeldasInput;
  id_plan_saas: CeldasInput;
  fecha_inscripcion: CeldasInput;
  estado: CeldasInput;
}

interface PropsFormSuscripciones {
  metodo: "POST" | "PUT" | null;
  formulario: FormularioSuscripcionTipado;
  error: string | null;
  carga: boolean;

  escuelas: EscuelaSelect[];
  planes: PlanSaasRow[];

  /* Unión de tipos: la pide SelectorOpt (<select>) y Inputs la acepta igual */
  cachearFormulario: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  postSuscripcion: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
  putSuscripcion: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  onCerrar: () => void;
}

export const FormularioSuscripciones = (props: PropsFormSuscripciones) => {
  const {
    metodo,
    formulario,
    error,
    carga,
    escuelas,
    planes,
    cachearFormulario,
    postSuscripcion,
    putSuscripcion,
    onCerrar,
  } = props;

  return (
    <form className="form-susp" action="">
      <header className="form-susp__encabezado">
        <h2 className="form-susp__titulo">
          {metodo === "PUT" ? "Editar suscripción" : "Nueva suscripción"}
        </h2>
        <p className="form-susp__subtitulo">
          Elegí la academia, el plan y la fecha de inscripción.
        </p>
      </header>

      <div className="form-susp__grupo form-susp__grupo--datos">
        {/* ---------- Academia ---------- */}
        <div className="form-susp__campo">
          <span className="form-susp__label">Academia</span>

          <SelectorOpt<EscuelaSelect>
            categorias={escuelas}
            itemKey="id_escuela"
            itemLabel="razon_social"
            name={formulario.id_escuela.name}
            value={formulario.id_escuela.value}
            labelDefault="Seleccione una academia..."
            onChangeSelector={cachearFormulario}
          />
        </div>

        {/* ---------- Plan ---------- */}
        <div className="form-susp__campo">
          <span className="form-susp__label">Plan</span>

          <SelectorOpt<PlanSaasRow>
            categorias={planes}
            itemKey="id_plan"
            itemLabel="descripcion"
            name={formulario.id_plan_saas.name}
            value={formulario.id_plan_saas.value}
            labelDefault="Seleccione un plan..."
            onChangeSelector={cachearFormulario}
          />
        </div>

        {/* ---------- Fecha de inscripción (el input date entrega YYYY-MM-DD, formato del server) ---------- */}
        <Inputs
          type="date"
          label="Fecha de inscripción"
          placeholder=""
          readonly={false}
          name={formulario.fecha_inscripcion.name}
          value={formulario.fecha_inscripcion.value}
          onChange={cachearFormulario}
        />

        {/* El vencimiento NO se muestra: lo calcula el server (hoy + 1 mes).
            El estado tampoco: un alta nueva siempre nace "activo". */}
      </div>

      <div className="form-susp__acciones">
        <Boton
          disable={carga}
          clase="agregar"
          logo="Add"
          type="button"
          texto={metodo === "PUT" ? "Actualizar" : "Guardar"}
          onClick={
            metodo === "POST"
              ? postSuscripcion
              : metodo === "PUT"
                ? putSuscripcion
                : undefined
          }
        />

        <Boton
          clase="cancelar"
          logo="Cancel"
          type="button"
          texto="Cancelar"
          onClick={onCerrar}
        />
      </div>

      {error && <CompoError mensaje={error} />}
    </form>
  );
};
