// Compontenes
import { Boton } from "../Boton/Boton";
import { Inputs } from "../Inputs/Inputs";

//css
import "./formularioAsistencia.css";

export const FormularioAsistencia = () => {
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
          <h2>Yoga</h2>
          <p>09:00 → 10:00</p>
        </div>

        <div className="clase_card proxima">
          <span className="badge">PRÓXIMA</span>
          <h2>Funcional</h2>
          <p>10:15 → 11:15</p>
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
            <strong>5</strong>
          </div>
        </div>

        <Boton clase="aceptar" texto="Asistir a clase" logo="Go" />
      </section>
    </div>
  );
};
