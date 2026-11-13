import React from "react";

import {
  ElementoLista,
  type InscripcionListado,
} from "../ElementoListadoInscrip/ElementoListado";

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
  abrirInscribir?: () => void;
}

const SKELETON_ROWS = 5;
const SKELETON_CARDS = 3;

export const ContenedorListadoInscripciones: React.FC<Props> = ({
  data,
  carga,
  onSeleccionarInscripcion,
  abrirInscribir,
}) => {
  const sinContenido = !carga && data.length === 0;
  const estaCargando = carga;

  return (
    <div className="listado_wrapper">
      {/* ==============================
          VISTA DESKTOP — Solo el header vive siempre dentro de la tabla
      ============================== */}
      <table className="tabla_inscripciones">
        <caption className="sr-only">Listado de inscripciones</caption>
        <thead className="tabla_header">
          <tr>
            <th scope="col">Alumno</th>
            <th scope="col">Plan y Pago</th>
            <th scope="col">Estado de Consumo</th>
            <th scope="col" className="text-right">Inicio</th>
            <th scope="col" className="text-right">Vigencia</th>
            <th scope="col" className="text-center">Estado</th>
          </tr>
        </thead>

        {estaCargando ? (
          <tbody className="tabla_body" aria-busy="true" aria-live="polite">
            {Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <tr key={`skeleton-${i}`} className="skeleton-row">
                <td><div className="skeleton-cell skeleton-cell--text" /></td>
                <td><div className="skeleton-cell skeleton-cell--text" /></td>
                <td><div className="skeleton-cell skeleton-cell--progress" /></td>
                <td className="text-right"><div className="skeleton-cell skeleton-cell--text" /></td>
                <td className="text-right"><div className="skeleton-cell skeleton-cell--text" /></td>
                <td className="text-center"><div className="skeleton-cell skeleton-cell--badge" /></td>
              </tr>
            ))}
          </tbody>
        ) : (
          <>
            {data.length > 0 && (
              <tbody className="tabla_body">
                {data.map((inscripcion) => (
                  <ElementoLista
                    key={inscripcion.id_inscripcion}
                    inscripcion={inscripcion}
                    mostrarDesktop={true}
                    mostrarMobile={false}
                    onSeleccionar={(id, metodo_pago, monto_pagado, nombre_completo, clases_totales, clases_tomadas, dni_alumno, vigencia, estado) => {
                      onSeleccionarInscripcion(id, metodo_pago, monto_pagado, nombre_completo, clases_totales, clases_tomadas, dni_alumno, vigencia, estado);
                    }}
                    vigencia={obtenerEstadoVigencia(inscripcion.vigencia, inscripcion.clases_usadas, inscripcion.clases_totales)}
                  />
                ))}
              </tbody>
            )}
          </>
        )}

        {sinContenido && (
          <tbody className="tabla_body">
            <tr>
              <td colSpan={6}>
                <div className="listado_estado_vacio">
                  <SinResultado
                    mensaje="No hay inscripciones con los filtros actuales"
                    accion={abrirInscribir ? { label: "Nueva inscripción", onClick: abrirInscribir } : undefined}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        )}
      </table>

      {/* ==============================
          VISTA MOBILE
      ============================== */}
      {estaCargando ? (
        <div className="listado_mobile" aria-busy="true" aria-live="polite">
          {Array.from({ length: SKELETON_CARDS }, (_, i) => (
            <div key={`skeleton-card-${i}`} className="skeleton-card">
              <div className="skeleton-card__header">
                <div className="skeleton-cell skeleton-cell--id" />
                <div className="skeleton-cell skeleton-cell--badge" />
              </div>
              <div className="skeleton-card__title" />
              <div className="skeleton-card__name" />
              <div className="skeleton-card__dni" />
              <div className="skeleton-card__plan" />
              <div className="skeleton-card__progress">
                <div className="skeleton-cell skeleton-cell--progress" />
              </div>
              <div className="skeleton-card__footer">
                <div className="skeleton-cell skeleton-cell--text" />
                <div className="skeleton-cell skeleton-cell--text" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length > 0 ? (
        <div className="listado_mobile">
          {data.map((inscripcion) => (
            <ElementoLista
              key={inscripcion.id_inscripcion}
              inscripcion={inscripcion}
              mostrarDesktop={false}
              mostrarMobile={true}
              onSeleccionar={(id, metodo_pago, monto_pagado, nombre_completo, clases_totales, clases_tomadas, dni_alumno, vigencia, estado) => {
                onSeleccionarInscripcion(id, metodo_pago, monto_pagado, nombre_completo, clases_totales, clases_tomadas, dni_alumno, vigencia, estado);
              }}
              vigencia={obtenerEstadoVigencia(inscripcion.vigencia, inscripcion.clases_usadas, inscripcion.clases_totales)}
            />
          ))}
        </div>
      ) : sinContenido ? (
        <div className="listado_mobile">
          <SinResultado
            mensaje="No hay inscripciones con los filtros actuales"
            accion={abrirInscribir ? { label: "Nueva inscripción", onClick: abrirInscribir } : undefined}
          />
        </div>
      ) : null}
    </div>
  );
};