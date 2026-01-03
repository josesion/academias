import {
  type DataProfesor,
  type DataNivel,
  type DataTipo,
  type DiaSemana,
  type Horas,
} from "../../tipadosTs/horario";

/**
 * Componente TarjetaHorario.
 *
 * Muestra un resumen visual del horario que se está creando o modificando.
 * Funciona como feedback en tiempo real del estado del formulario de horarios.
 *
 * Responsabilidades:
 * - Mostrar día y rango horario seleccionado.
 * - Mostrar profesor, nivel y tipo de clase elegidos.
 * - Indicar el estado actual del formulario (listo para guardar o incompleto).
 *
 * Comportamiento:
 * - Si algún dato no fue seleccionado, se muestran textos guía
 *   ("Elegir Profesor", "Elegir Nivel", etc.).
 * - El estado visual cambia según el mensaje recibido
 *   (ej: "Listo para Guardar" → estado válido).
 *
 * Uso típico:
 * - Se utiliza dentro del formulario de horarios, tanto en ALTA como en MOD.
 * - No gestiona estado propio: es un componente 100% presentacional.
 *
 * @param dataProfe Profesor seleccionado (o null si no hay selección).
 * @param dataNivel Nivel seleccionado (o null).
 * @param dataTipo Tipo de clase seleccionado (o null).
 * @param dia Día de la semana seleccionado.
 * @param hora_inicio Hora de inicio.
 * @param hora_fin Hora de fin.
 * @param metodo Indica si el formulario está en modo ALTA o MOD.
 * @param mensajeEstado Texto que describe el estado actual del formulario.
 */

export interface DataFormHorarios {
  dataProfe: DataProfesor | null;
  dataNivel: DataNivel | null;
  dataTipo: DataTipo | null;
  dia: DiaSemana | null;
  hora_inicio: Horas | null;
  hora_fin: Horas | null;
  metodo: "ALTA" | "MOD" | null;
  mensajeEstado: string;
}

export const TarjetaHorario = (data: DataFormHorarios) => {
  const claseEstado =
    data.mensajeEstado === "Listo para Guardar" ? "listo" : "error";
  return (
    <div className="info_horario">
      <h3 className="info_horario_titulo">Información del horario</h3>
      <div className="info_horario_bloque">
        <div className="info_item">
          <span className="info_label">Día:</span>
          <span className="info_valor">{data.dia}</span>
        </div>

        <div className="info_item">
          <span className="info_label">Horario:</span>
          <span className="info_valor">
            {data.hora_inicio ? data.hora_inicio : "--:--"}--
            {data.hora_fin ? data.hora_fin : "--:--"}
          </span>
        </div>
      </div>

      <hr className="info_divisor" />

      <div className="info_horario_bloque">
        <div className="info_item">
          <span className="info_label">Profesor:</span>
          <span className="info_valor">
            {data.dataProfe
              ? `${data.dataProfe.Apellido} ${data.dataProfe.Nombre}`
              : "Elegir Profesor"}
          </span>
        </div>

        <div className="info_item">
          <span className="info_label">Nivel:</span>
          <span className="info_valor">
            {data.dataNivel ? data.dataNivel.nivel : "Elegir Nivel"}
          </span>
        </div>

        <div className="info_item">
          <span className="info_label">Tipo:</span>
          <span className="info_valor">
            {data.dataTipo ? data.dataTipo.tipo : "Elegir Tipo"}
          </span>
        </div>
      </div>

      <hr className="info_divisor" />

      <div className="info_estado">
        <span className="info_estado_label">Estado:</span>
        <span className={`info_estado_valor ${claseEstado}`}>
          {data.mensajeEstado}
        </span>
      </div>
    </div>
  );
};
