import React from "react";
import {
  Calendar,
  Clock,
  User,
  Award,
  Tag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  type DataProfesor,
  type DataNivel,
  type DataTipo,
  type DiaSemana,
  type Horas,
} from "../../../tipadosTs/horario";

import "./tarjetahorario.css";

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

export const TarjetaHorario: React.FC<DataFormHorarios> = (data) => {
  const esListo = data.mensajeEstado === "Listo para Guardar";

  return (
    <div className="card_cierre tarjeta_resumen_horario">
      <div className="card_titulo">
        <span>Resumen del Horario</span>
        {data.metodo && <span className="badge_metodo">{data.metodo}</span>}
      </div>

      {/* BLOQUE TEMPORAL (Día y Hora) */}
      <div className="info_horario_bloque">
        <div className="info_item">
          <span className="info_label_con_icono">
            <Calendar size={14} /> Día
          </span>
          <span className="info_valor">{data.dia || "No seleccionado"}</span>
        </div>

        <div className="info_item">
          <span className="info_label_con_icono">
            <Clock size={14} /> Horario
          </span>
          <span className="info_valor codigo">
            {data.hora_inicio || "--:--"} — {data.hora_fin || "--:--"}
          </span>
        </div>
      </div>

      <div className="info_divisor" />

      {/* BLOQUE DETALLES (Profesor, Nivel, Tipo) */}
      <div className="info_horario_bloque">
        <div className="info_item">
          <span className="info_label_con_icono">
            <User size={14} /> Profesor
          </span>
          <span
            className={`info_valor ${!data.dataProfe ? "placeholder" : ""}`}
          >
            {data.dataProfe
              ? `${data.dataProfe.Apellido} ${data.dataProfe.Nombre}`
              : "Elegir Profesor"}
          </span>
        </div>

        <div className="info_item">
          <span className="info_label_con_icono">
            <Award size={14} /> Nivel
          </span>
          <span
            className={`info_valor ${!data.dataNivel ? "placeholder" : ""}`}
          >
            {data.dataNivel ? data.dataNivel.nivel : "Elegir Nivel"}
          </span>
        </div>

        <div className="info_item">
          <span className="info_label_con_icono">
            <Tag size={14} /> Tipo
          </span>
          <span className={`info_valor ${!data.dataTipo ? "placeholder" : ""}`}>
            {data.dataTipo ? data.dataTipo.tipo : "Elegir Tipo"}
          </span>
        </div>
      </div>

      <div className="info_divisor" />

      {/* BLOQUE ESTADO */}
      <div className={`info_estado_banner ${esListo ? "listo" : "error"}`}>
        {esListo ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        <span className="info_estado_texto">{data.mensajeEstado}</span>
      </div>
    </div>
  );
};
