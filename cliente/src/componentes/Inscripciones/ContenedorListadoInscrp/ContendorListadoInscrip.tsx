import React from "react";

import {
  ElementoLista,
  type InscripcionListado,
} from "../ElementoListadoInscrip/ElementoListado";

import { ComponenteCargando } from "../../generales/Cargando/Cargando";
import { SinResultado } from "../../generales/SinItemsListado/SinResultado";
import { obtenerEstadoVigencia } from "../../../utils/fecha";

import "./contenedorlsitado.css";

interface Props {
  data: InscripcionListado[];
  carga: boolean;
  onSeleccionarInscripcion: (
    id: number,
    metodo_pago: string,
    monto_pagado: string,
    nombre_completo: string,
    clases_totales: number,
    clases_tomadas: number,
    dni_alumno: number,
    vigencia: string,
    estado: string,
  ) => void;
}

export const ContenedorListadoInscripciones: React.FC<Props> = ({
  data,
  carga,
  onSeleccionarInscripcion,
}) => {
  const sinContenido = carga || data.length === 0;

  return (
    <div className="listado_wrapper">
      {/* ==============================
          VISTA DESKTOP — Solo el header vive siempre dentro de la tabla
      ============================== */}
      <table className="tabla_inscripciones">
        <thead className="tabla_header">
          <tr>
            <th>Alumno</th>
            <th>Plan y Pago</th>
            <th>Estado de Consumo</th>
            <th className="text-right">Inicio</th>
            <th className="text-right">Vigencia</th>
            <th className="text-center">Estado</th>
          </tr>
        </thead>

        {!sinContenido && (
          <tbody className="tabla_body">
            {data.map((inscripcion) => (
              <ElementoLista
                key={inscripcion.id_inscripcion}
                inscripcion={inscripcion}
                mostrarDesktop={true}
                mostrarMobile={false}
                onSeleccionar={(
                  id,
                  metodo_pago,
                  monto_pagado,
                  nombre_completo,
                  clases_totales,
                  clases_tomadas,
                  dni_alumno,
                  vigencia,
                  estado,
                ) => {
                  onSeleccionarInscripcion(
                    id,
                    metodo_pago,
                    monto_pagado,
                    nombre_completo,
                    clases_totales,
                    clases_tomadas,
                    dni_alumno,
                    vigencia,
                    estado,
                  );
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

      {/* ==============================
          ESTADO VACÍO / CARGANDO — fuera de la tabla, centrado real
      ============================== */}
      {sinContenido && (
        <div className="listado_estado_vacio">
          {carga ? <ComponenteCargando /> : <SinResultado />}
        </div>
      )}

      {/* ==============================
          VISTA MOBILE
      ============================== */}
      {!sinContenido && (
        <div className="listado_mobile">
          {data.map((inscripcion) => (
            <ElementoLista
              key={inscripcion.id_inscripcion}
              inscripcion={inscripcion}
              mostrarDesktop={false}
              mostrarMobile={true}
              onSeleccionar={(
                id,
                metodo_pago,
                monto_pagado,
                nombre_completo,
                clases_totales,
                clases_tomadas,
                dni_alumno,
                vigencia,
                estado,
              ) => {
                onSeleccionarInscripcion(
                  id,
                  metodo_pago,
                  monto_pagado,
                  nombre_completo,
                  clases_totales,
                  clases_tomadas,
                  dni_alumno,
                  vigencia,
                  estado,
                );
              }}
              vigencia={obtenerEstadoVigencia(
                inscripcion.vigencia,
                inscripcion.clases_usadas,
                inscripcion.clases_totales,
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
