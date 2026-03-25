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
}

export const ContenedorListadoInscripciones: React.FC<Props> = ({
  data,
  carga,
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
          <ComponenteCargando />
        ) : data.length === 0 ? (
          <td colSpan={4} className="sin_datos">
            <SinResultado />
          </td>
        ) : (
          <tbody className="tabla_body">
            {data.length > 0 ? (
              data.map((inscripcion) => (
                <ElementoLista
                  key={inscripcion.id_inscripcion}
                  inscripcion={inscripcion}
                  vigencia={obtenerEstadoVigencia(
                    inscripcion.vigencia,
                    inscripcion.clases_usadas,
                    inscripcion.clases_totales,
                  )}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="sin_datos">
                  No se encontraron inscripciones con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </div>
  );
};
