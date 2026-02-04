//Componentes
import { SelectorPlegable } from "../Selector/Selector";
import { TarjetaInscripcion } from "../TarjetaInscripcion/TarjetaInscripcion";
import { MetodoPagoInscripcion } from "../PagoInscripcion/MetodoPago";
import { Boton } from "../Boton/Boton";

//Typado
import { type DataAlumno, type DataPlan } from "../../tipadosTs/inscripciones";

import "./formInscripcion.css";

interface InscripcionProps {
  errorGenerico: string | null;

  plan: DataPlan | null;
  alumno: DataAlumno | null;
  notas: string;
  enviando: boolean;

  listadoPlan: DataPlan[];
  listadoAlumno: DataAlumno[];

  handleCachearPlan: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCachearAlumno: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCachearMetodoPago: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextAreaNotas: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

  inscribir: (e: React.FormEvent<HTMLFormElement>) => void;
  cancelar: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const InscripcionForm: React.FC<InscripcionProps> = (props) => {
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
    <form className="formulario_inscripcion_contenedor" onSubmit={inscribir}>
      <p className="tarjeta_titulo">Contratación e Pago Inicial del Plan</p>
      <div className="formulario_inscripcion_filtros">
        <SelectorPlegable<DataPlan>
          titulo="Planes activos"
          objetoListado={listadoPlan}
          onChange={handleCachearPlan}
          input_list="list_planes"
          valueKey="descripcion"
          tipo="text"
          name="descripcion"
        />

        <SelectorPlegable<DataAlumno>
          titulo="Alumnos activos "
          objetoListado={listadoAlumno}
          onChange={handleCachearAlumno}
          input_list="list_alumnos"
          valueKey="dni"
          displayKey="persona"
          tipo="text"
          name="dni"
        />
      </div>

      <div className="formulario_inscripcion_info">
        <TarjetaInscripcion plan={plan} alumno={alumno} />

        <MetodoPagoInscripcion
          handleCachearMetodoPago={handleCachearMetodoPago}
          handleTextAreaNotas={handleTextAreaNotas}
          notas={notas}
        />
      </div>

      <div className="formulario_inscripcion_mensaje_error">
        {errorGenerico && <p className="mensaje_error"> {errorGenerico}</p>}
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
