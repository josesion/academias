// Compontenes
import { Boton } from "../../../componentes/Boton/Boton";
import { Inputs } from "../../../componentes/Inputs/Inputs";

import { useAsistenciaSet } from "../../../hookNegocios/asistencia";

//css
import "./formularioAsistencia.css";

export const FormularioAsistencia = () => {
  const { claseEnCurso, claseProxima } = useAsistenciaSet();

  return (
    <div className="asistencia_kiosco">
      <header className="asistencia_header">
        <h1>Academia Fuerza Gigante</h1>
        <p>Registro de asistencia</p>
      </header>

      {/* ───────── CLASES ───────── */}
      <section className="asistencia_clases">
        <div className="clase_card actual">
          <span className="badge">EN CURSO</span>
          <h2>
            {claseEnCurso && "nombre_clase" in claseEnCurso
              ? claseEnCurso.nombre_clase
              : "Sin clase en curso"}
          </h2>
          <p>
            {claseEnCurso && "hora_inicio" in claseEnCurso
              ? claseEnCurso.hora_inicio
              : "00:00"}{" "}
            →{" "}
            {claseEnCurso && "hora_fin" in claseEnCurso
              ? claseEnCurso.hora_fin
              : "00:00"}
          </p>
        </div>

        <div className="clase_card proxima">
          <span className="badge">PRÓXIMA</span>
          <h2>
            {claseProxima && "nombre_clase" in claseProxima
              ? claseProxima.nombre_clase
              : "Sin mas clases por hoy"}
          </h2>
          <p>
            {" "}
            {claseProxima && "hora_inicio" in claseProxima
              ? claseProxima.hora_inicio
              : "00:00"}{" "}
            →{" "}
            {claseProxima && "hora_fin" in claseProxima
              ? claseProxima.hora_fin
              : "00:00"}
          </p>
        </div>
      </section>

      {/* ───────── ACCIÓN ───────── */}
      <section className="asistencia_accion">
        <Inputs
          label="Ingrese su DNI"
          placeholder="Ej: 30023547"
          name="dni"
          type="number"
          value={"33333"}
          error={""}
          readonly={false}
        />

        <div className="estado_inscripcion">
          <div>
            <span>Vencimiento : </span>
            <strong>15 / 02 / 2026</strong>
          </div>
          <div>
            <span>Clases restantes : </span>
            <strong>6</strong>
          </div>
        </div>

        <Boton clase="aceptar" texto="Asistir a clase" logo="Go" />
      </section>
    </div>
  );
};
