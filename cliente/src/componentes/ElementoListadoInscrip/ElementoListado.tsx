import React from "react";
// Importamos los iconos que le dan el toque visual
import { User, CreditCard, Activity } from "lucide-react";

import "./elementolista.css";

export interface InscripcionListado {
  id_inscripcion: number;
  dni_alumno: number;
  nombre_completo: string;
  nombre_plan: string;
  clases_usadas: number;
  clases_totales: number;
  fecha_inicio: string;
  vigencia: string;
  monto_pagado: string;
  metodo_pago: "transferencia" | "efectivo" | "tarjeta" | string;
}

interface ElementoListaProps {
  inscripcion: InscripcionListado;
}

export const ElementoLista: React.FC<ElementoListaProps> = ({
  inscripcion,
}) => {
  // Calculamos el porcentaje de clases para la barra
  const porcentajeUso =
    (inscripcion.clases_usadas / inscripcion.clases_totales) * 100;

  return (
    <tr className="fila_inscripcion group">
      {/* CELDA ALUMNO */}
      <td className="celda_inscripcion">
        <div className="alumno_contenedor">
          <div className="alumno_avatar">
            <User size={16} />
          </div>
          <div className="alumno_info">
            <span className="alumno_nombre">{inscripcion.nombre_completo}</span>
            <span className="alumno_dni">
              DNI: {inscripcion.dni_alumno.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </td>

      {/* CELDA PLAN Y PAGO */}
      <td className="celda_inscripcion">
        <div className="plan_contenedor">
          <span className="plan_nombre">{inscripcion.nombre_plan}</span>
          <div className="pago_info">
            <div className="pago_monto">
              <CreditCard size={12} />
              <span>
                ${Number(inscripcion.monto_pagado).toLocaleString("es-AR")}
              </span>
            </div>
            <span className="pago_metodo">{inscripcion.metodo_pago}</span>
          </div>
        </div>
      </td>

      {/* CELDA USO DE CLASES */}
      <td className="celda_inscripcion">
        <div className="consumo_contenedor">
          <div className="consumo_header">
            <div className="consumo_titulo">
              <Activity size={10} />
              <span>Consumo</span>
            </div>
            <span className="consumo_numeros">
              {inscripcion.clases_usadas} /{" "}
              {inscripcion.clases_totales > 1000
                ? `${(inscripcion.clases_totales / 1000).toFixed(0)}k`
                : inscripcion.clases_totales}
            </span>
          </div>
          <div className="barra_fondo">
            <div
              className="barra_progreso"
              style={{ width: `${porcentajeUso}%` }}
            />
          </div>
        </div>
      </td>

      {/* CELDA VIGENCIA */}
      <td className="celda_inscripcion">
        <div className="vigencia_contenedor">
          <span className="vigencia_label">Vence</span>
          <span className="vigencia_fecha">{inscripcion.vigencia}</span>
        </div>
      </td>
    </tr>
  );
};
