import React from "react";
import {
  ElementoLista,
  type InscripcionListado,
} from "../ElementoListadoInscrip/ElementoListado";
import { ComponenteCargando } from "../Cargando/Cargando";
import { SinResultado } from "../SinItemsListado/SinResultado";

import "./contenedorlsitado.css";
interface Props {
  data: InscripcionListado[];
  carga: boolean;
  statusCode: number;
}

export const ContenedorListadoInscripciones: React.FC<Props> = ({
  data,
  carga,
  statusCode,
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
            <th className="text-right">Vigencia</th>
          </tr>
        </thead>

        {carga === true ? (
          <ComponenteCargando />
        ) : statusCode === 404 ? (
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
