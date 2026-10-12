import { useContext } from "react";
import { RutasProtegidasContext } from "../../../contexto/protectRutas";
//Componentes
import { SelectorPlegable } from "../../generales/Selector/Selector";
import { TarjetaInscripcion } from "../TarjetaInscripcion/TarjetaInscripcion";
import { MetodoPagoInscripcion } from "../PagoInscripcion/MetodoPago";
import { Boton } from "../../generales/Boton/Boton";

//Typado
import {
  type DataAlumno,
  type DataPlan,
} from "../../../tipadosTs/inscripciones";

import "./formInscripcion.css";

interface MetodoPago {
  id_metodo: number;
  descripcion_cuenta: string;
}

interface InscripcionProps {
  errorGenerico: string | null;

  plan: DataPlan | null;
  alumno: DataAlumno | null;
  notas: string;
  enviando: boolean;

  listadoPlan: DataPlan[];
  listadoAlumno: DataAlumno[];
  listaMetodo: MetodoPago[];

  handleCachearPlan: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCachearAlumno: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCachearMetodoPago: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTextAreaNotas: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

  inscribir: (e: React.FormEvent<HTMLFormElement>) => void;
  cancelar: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const InscripcionForm: React.FC<InscripcionProps> = (props) => {
  const { rol } = useContext(RutasProtegidasContext);

  const {
    plan,
    alumno,
    notas,
    enviando,
    errorGenerico,
    listadoPlan,
    listadoAlumno,
    handleCachearPlan,
    handleCachearAlumno,
    handleCachearMetodoPago,
    handleTextAreaNotas,
    inscribir,
    cancelar,
  } = props;

  return (
    <form
      className="formulario_inscripcion_contenedor"
      onSubmit={inscribir}
      role="form"
      aria-labelledby="form_inscripcion_titulo"
      aria-describedby={errorGenerico ? "form_inscripcion_error" : undefined}
      noValidate
    >
      <h2 id="form_inscripcion_titulo" className="section-title">
        Contratación e Pago Inicial del Plan
      </h2>
      <div className="formulario_inscripcion_filtros">
        <SelectorPlegable<DataPlan>
          titulo="Planes activos"
          objetoListado={listadoPlan}
          onChange={handleCachearPlan}
          input_list="list_planes"
          valueKey="descripcion"
          tipo="text"
          name="descripcion"
          hint="Escribe el nombre del plan para filtrar..."
        />

        <SelectorPlegable<DataAlumno>
          titulo="Alumnos activos"
          objetoListado={listadoAlumno}
          onChange={handleCachearAlumno}
          input_list="list_alumnos"
          valueKey="dni"
          displayKey="persona"
          tipo="text"
          name="dni"
          hint="Escribe nombre, apellido o DNI para filtrar..."
        />
      </div>

      <div className="formulario_inscripcion_info">
        <TarjetaInscripcion plan={plan} alumno={alumno} />

        {rol?.tipo === "intermedio" && (
          <MetodoPagoInscripcion
            listaMetodoPago={props.listaMetodo}
            handleCachearMetodoPago={handleCachearMetodoPago}
            handleTextAreaNotas={handleTextAreaNotas}
            notas={notas}
          />
        )}
      </div>

      <div
        className="formulario_inscripcion_mensaje_error"
        role="alert"
        aria-live="assertive"
        id="form_inscripcion_error"
      >
        {errorGenerico && <p className="mensaje_error">{errorGenerico}</p>}
      </div>

      <div className="formulario_inscripcion_botones">
        <Boton
          texto="Confirmar Inscripcion y Pagar"
          logo="Add"
          clase="aceptar"
          focus={false}
          disable={enviando}
        />

        <Boton
          texto="Cancelar"
          logo="Cancel"
          clase="cancelar"
          focus={false}
          onClick={cancelar}
        />
      </div>
    </form>
  );
};
