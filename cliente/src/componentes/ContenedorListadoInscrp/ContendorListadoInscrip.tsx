import React from "react";
import {
  ElementoLista,
  type InscripcionListado,
} from "../ElementoListadoInscrip/ElementoListado";
import { ComponenteCargando } from "../Cargando/Cargando";
import { SinResultado } from "../SinItemsListado/SinResultado";

import { obtenerEstadoVigencia } from "../../utils/fecha";
import "./contenedorlsitado.css";
interface Props {
  data: InscripcionListado[];
  carga: boolean;
  onSeleccionarInscripcion: (
    id: number,
    metodo_pago: string,
    monto_pagado: string,
  ) => void;
}

export const ContenedorListadoInscripciones: React.FC<Props> = ({
  data,
  carga,
  onSeleccionarInscripcion,
}) => {
  return (
    <div className="listado_wrapper">
      <table className="tabla_inscripciones">
        {/* Encabezados: solo se ven en Desktop */}
        <thead className="tabla_header">
          <tr>
            <th>Alumno</th>
            <th>Plan y Pago</th>
            <th>Estado de Consumo</th>
            <th className="text-right">Inicio</th>
            <th className="text-right">Vigencia</th>
          </tr>
        </thead>

        {carga === true ? (
          <tbody className="tabla_body">
            <tr>
              <td colSpan={5}>
                <ComponenteCargando />
              </td>
            </tr>
          </tbody>
        ) : data.length === 0 ? (
          <tbody className="tabla_body">
            <tr>
              <td colSpan={5} className="sin_datos">
                <SinResultado />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="tabla_body">
            {data.map((inscripcion) => (
              <ElementoLista
                key={inscripcion.id_inscripcion}
                inscripcion={inscripcion}
                onSeleccionar={(id, metodo_pago, monto_pagado) => {
                  onSeleccionarInscripcion(id, metodo_pago, monto_pagado);
                }}
                vigencia={obtenerEstadoVigencia(
                  inscripcion.vigencia,
                  inscripcion.clases_usadas,
                  inscripcion.clases_totales,
                )}
              />
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
};
